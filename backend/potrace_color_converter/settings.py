import json
from pathlib import Path
from typing import Any, Dict


class PotraceColorSettings:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.settings_file = self.project_root / "potrace_color_settings.json"

        self.default_settings: Dict[str, Dict[str, Any]] = {
            "n_colors": {
                "value": 8,
                "description": "Number of palette colors after k-means. Each becomes one SVG layer.",
                "range": [2, 16],
            },
            "upscale_factor": {
                "value": 3,
                "description": "Pre-trace upscale multiplier. Higher = sub-pixel-equivalent edge precision, slower.",
                "type": "enum",
                "options": [1, 2, 3, 4],
            },
            "smoothing": {
                "value": "mean_shift",
                "description": "Edge-preserving preprocessor. mean_shift is highest quality; bilateral is faster; none skips smoothing.",
                "type": "enum",
                "options": ["none", "bilateral", "mean_shift"],
            },
            "smooth_spatial_radius": {
                "value": 15,
                "description": "Spatial window radius for smoothing. Larger = more neighborhood influence.",
                "range": [5, 50],
            },
            "smooth_color_radius": {
                "value": 20,
                "description": "Color window radius for smoothing. Larger = more aggressive color merging.",
                "range": [5, 50],
            },
            "alpha_threshold": {
                "value": 128,
                "description": "Pixels with alpha below this are treated as transparent and excluded from tracing.",
                "range": [0, 255],
            },
            "min_region_pixels": {
                "value": 32,
                "description": "Drop color regions smaller than this pixel count (measured pre-upscale).",
                "range": [0, 500],
            },
            "turdsize": {
                "value": 2,
                "description": "Potrace speckle filter: minimum shape area in pixels (passthrough).",
                "range": [0, 100],
            },
            "alphamax": {
                "value": 1.0,
                "description": "Potrace corner threshold. Lower = sharper corners, higher = smoother curves.",
                "range": [0.0, 2.0],
            },
            "opttolerance": {
                "value": 0.2,
                "description": "Potrace curve optimization tolerance. Lower = more precise, higher = simpler curves.",
                "range": [0.0, 1.0],
            },
            "longcurve": {
                "value": True,
                "description": "Enable Potrace --longcurve optimization for smoother paths.",
                "type": "boolean",
            },
        }

        self.current_settings = self._load_settings()

    def _load_settings(self) -> Dict[str, Any]:
        if self.settings_file.exists():
            try:
                with open(self.settings_file, "r") as f:
                    saved = json.load(f)
                    merged = {k: dict(v) for k, v in self.default_settings.items()}
                    for key, entry in saved.items():
                        if key in merged and "value" in entry:
                            merged[key]["value"] = entry["value"]
                    return merged
            except Exception as e:
                print(f"Error loading potrace color settings: {e}")
        return {k: dict(v) for k, v in self.default_settings.items()}

    def _save_settings(self):
        try:
            with open(self.settings_file, "w") as f:
                json.dump(self.current_settings, f, indent=2)
        except Exception as e:
            print(f"Error saving potrace color settings: {e}")

    def get_settings(self) -> Dict[str, Any]:
        return {key: entry["value"] for key, entry in self.current_settings.items()}
