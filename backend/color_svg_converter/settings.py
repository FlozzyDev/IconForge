import json
from pathlib import Path
from typing import Any, Dict


class ColorSVGSettings:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.settings_file = self.project_root / "color_svg_settings.json"

        self.default_settings: Dict[str, Dict[str, Any]] = {
            "colormode": {
                "value": "color",
                "description": "Color mode. 'color' preserves palette; 'binary' produces a B&W output.",
                "type": "enum",
                "options": ["color", "binary"],
            },
            "hierarchical": {
                "value": "cutout",
                "description": "Shape layering. 'cutout' = non-overlapping editable paths; 'stacked' = layered (simpler, overlaps).",
                "type": "enum",
                "options": ["stacked", "cutout"],
            },
            "mode": {
                "value": "spline",
                "description": "Curve fitting mode. spline = smooth Beziers, polygon = straight edges, none = raw pixels.",
                "type": "enum",
                "options": ["spline", "polygon", "none"],
            },
            "filter_speckle": {
                "value": 4,
                "description": "Removes shapes smaller than this many pixels (noise filter).",
                "range": [0, 100],
            },
            "color_precision": {
                "value": 6,
                "description": "Bits per color channel for palette quantization. Higher = more distinct colors.",
                "range": [1, 8],
            },
            "layer_difference": {
                "value": 16,
                "description": "Minimum color distance between layers. Higher = fewer, more distinct color regions.",
                "range": [0, 256],
            },
            "corner_threshold": {
                "value": 60,
                "description": "Minimum angle (degrees) to be considered a corner. Lower = more corners detected.",
                "range": [0, 180],
            },
            "length_threshold": {
                "value": 4.0,
                "description": "Minimum path segment length. Tune based on image resolution.",
                "range": [3.5, 10.0],
            },
            "splice_threshold": {
                "value": 45,
                "description": "Angle threshold (degrees) for splicing curves. Lower = more curve splits.",
                "range": [0, 180],
            },
            "path_precision": {
                "value": 8,
                "description": "Decimal precision for path coordinates. Higher = more accurate, larger file.",
                "range": [1, 16],
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
                print(f"Error loading color SVG settings: {e}")
        return {k: dict(v) for k, v in self.default_settings.items()}

    def _save_settings(self):
        try:
            with open(self.settings_file, "w") as f:
                json.dump(self.current_settings, f, indent=2)
        except Exception as e:
            print(f"Error saving color SVG settings: {e}")

    def get_settings(self) -> Dict[str, Any]:
        return {key: entry["value"] for key, entry in self.current_settings.items()}
