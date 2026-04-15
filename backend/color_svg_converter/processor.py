from pathlib import Path
from typing import Optional

try:
    import vtracer
    _VTRACER_AVAILABLE = True
except ImportError:
    _VTRACER_AVAILABLE = False


class ColorSVGConverter:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.input_dir = (
            self.project_root / "backend" / "background_remover" / "output"
        )
        self.output_dir = self.input_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.settings = self._load_settings()

    def _load_settings(self) -> dict:
        try:
            from backend.color_svg_converter.settings import ColorSVGSettings

            return ColorSVGSettings().get_settings()
        except Exception as e:
            print(f"Warning: Could not load color SVG settings, using defaults: {e}")
            return {
                "colormode": "color",
                "hierarchical": "cutout",
                "mode": "spline",
                "filter_speckle": 4,
                "color_precision": 6,
                "layer_difference": 16,
                "corner_threshold": 60,
                "length_threshold": 4.0,
                "splice_threshold": 45,
                "path_precision": 8,
            }

    @staticmethod
    def check_vtracer() -> bool:
        return _VTRACER_AVAILABLE

    def convert(self, image_path: Path, settings: Optional[dict] = None) -> Path:
        """Convert an image to a colored multi-path SVG via VTracer.

        Args:
            image_path: Path to the source image (typically a background-removed PNG).
            settings: Optional override dict of VTracer parameters.
        """
        if not _VTRACER_AVAILABLE:
            raise RuntimeError(
                "vtracer is not installed. Run `uv add vtracer` to enable color SVG conversion."
            )

        active = dict(self.settings)
        if settings:
            active.update(settings)

        output_path = self.output_dir / f"{image_path.stem}_color_vector.svg"

        try:
            vtracer.convert_image_to_svg_py(
                str(image_path),
                str(output_path),
                colormode=active["colormode"],
                hierarchical=active["hierarchical"],
                mode=active["mode"],
                filter_speckle=int(active["filter_speckle"]),
                color_precision=int(active["color_precision"]),
                layer_difference=int(active["layer_difference"]),
                corner_threshold=int(active["corner_threshold"]),
                length_threshold=float(active["length_threshold"]),
                splice_threshold=int(active["splice_threshold"]),
                path_precision=int(active["path_precision"]),
            )
        except Exception as e:
            raise RuntimeError(f"VTracer conversion failed: {e}")

        return output_path
