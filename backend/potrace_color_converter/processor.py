import os
import subprocess
from pathlib import Path
from typing import Optional

import numpy as np
from dotenv import load_dotenv
from PIL import Image

from backend.potrace_color_converter.preprocess import (
    edge_preserving_smooth,
    quantize_lab,
    upscale_rgba,
)
from backend.potrace_color_converter.potrace_runner import trace_mask
from backend.potrace_color_converter.svg_composer import compose_svg

load_dotenv()


class PotraceColorConverter:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.input_dir = (
            self.project_root / "backend" / "background_remover" / "output"
        )
        self.output_dir = self.input_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

        potrace_path = os.getenv("POTRACE_PATH")
        if potrace_path:
            self.potrace_path = Path(potrace_path)
        else:
            self.potrace_path = Path("C:/Tools/potrace-1.16.win64/potrace.exe")

        self.settings = self._load_settings()

    def _load_settings(self) -> dict:
        try:
            from backend.potrace_color_converter.settings import PotraceColorSettings

            return PotraceColorSettings().get_settings()
        except Exception as e:
            print(f"Warning: could not load potrace color settings, using defaults: {e}")
            return {
                "n_colors": 8,
                "upscale_factor": 3,
                "smoothing": "mean_shift",
                "smooth_spatial_radius": 15,
                "smooth_color_radius": 20,
                "alpha_threshold": 128,
                "min_region_pixels": 32,
                "turdsize": 2,
                "alphamax": 1.0,
                "opttolerance": 0.2,
                "longcurve": True,
            }

    def check_potrace(self) -> bool:
        if not self.potrace_path.exists():
            return False
        try:
            result = subprocess.run(
                [str(self.potrace_path), "--version"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
            return False

    def convert(self, image_path: Path, settings: Optional[dict] = None) -> Path:
        """Convert a background-removed PNG to a color SVG via AA-aware preprocessing
        + per-color Potrace tracing.
        """
        if not self.check_potrace():
            raise RuntimeError(
                "Potrace not found. Set POTRACE_PATH in .env or install at the default location."
            )

        active = dict(self.settings)
        if settings:
            active.update(settings)

        # 1. Load RGBA
        img = Image.open(image_path).convert("RGBA")
        rgb = np.array(img.convert("RGB"))
        alpha = np.array(img.getchannel("A"))
        original_h, original_w = rgb.shape[:2]

        # 2. Optional upscale (Lanczos RGB, nearest alpha)
        upscale = int(active.get("upscale_factor", 3))
        rgb, alpha = upscale_rgba(rgb, alpha, upscale)

        # 3. Edge-preserving smooth (only on RGB)
        rgb = edge_preserving_smooth(
            rgb,
            mode=str(active.get("smoothing", "mean_shift")),
            spatial_radius=int(active.get("smooth_spatial_radius", 15)),
            color_radius=int(active.get("smooth_color_radius", 20)),
        )

        # 4. Build opaque mask
        alpha_threshold = int(active.get("alpha_threshold", 128))
        opaque_mask = alpha >= alpha_threshold

        # 5. k-means quantize opaque pixels in Lab
        n_colors = int(active.get("n_colors", 8))
        labels, centers_rgb = quantize_lab(rgb, opaque_mask, n_colors)

        # 6. Per-color: build mask → Potrace → collect
        min_region = int(active.get("min_region_pixels", 32))
        # min_region is specified in SOURCE pixels; scale to the current (upscaled) space.
        min_region_scaled = min_region * (upscale * upscale)

        potrace_settings = {
            "turdsize": active.get("turdsize", 2),
            "alphamax": active.get("alphamax", 1.0),
            "opttolerance": active.get("opttolerance", 0.2),
            "longcurve": active.get("longcurve", True),
        }

        paths = []
        for color_idx in range(centers_rgb.shape[0]):
            mask = labels == color_idx
            area = int(mask.sum())
            if area < min_region_scaled:
                continue
            traced = trace_mask(mask, self.potrace_path, potrace_settings)
            if not traced:
                continue
            d, transform = traced
            r, g, b = centers_rgb[color_idx].tolist()
            paths.append((d, transform, (int(r), int(g), int(b)), area))

        if not paths:
            raise RuntimeError("No traceable regions found after quantization.")

        # 7. Compose layered SVG at original dimensions
        output_path = self.output_dir / f"{image_path.stem}_color_precision.svg"
        compose_svg(paths, original_w, original_h, upscale, output_path)
        return output_path
