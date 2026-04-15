import type { ColorSVGSettings } from "@/types"

export interface ColorSVGPreset {
  id: string
  label: string
  description: string
  settings: ColorSVGSettings
}

export const COLOR_SVG_PRESETS: ColorSVGPreset[] = [
  {
    id: "defaults",
    label: "Defaults",
    description: "VTracer's recommended starting point for most inputs.",
    settings: {
      colormode: "color",
      hierarchical: "cutout",
      mode: "spline",
      filter_speckle: 4,
      color_precision: 6,
      layer_difference: 16,
      corner_threshold: 60,
      length_threshold: 4.0,
      splice_threshold: 45,
      path_precision: 8,
    },
  },
  {
    id: "clean-logo",
    label: "Clean Logo",
    description:
      "Bold color regions, smooth curves, heavily filtered noise. Ideal for flat logos.",
    settings: {
      colormode: "color",
      hierarchical: "cutout",
      mode: "spline",
      filter_speckle: 8,
      color_precision: 5,
      layer_difference: 32,
      corner_threshold: 60,
      length_threshold: 4.0,
      splice_threshold: 45,
      path_precision: 8,
    },
  },
  {
    id: "photo-to-vector",
    label: "Photo \u2192 Vector",
    description:
      "Larger palette with smoothed gradient bands. Bigger file, more fidelity.",
    settings: {
      colormode: "color",
      hierarchical: "cutout",
      mode: "spline",
      filter_speckle: 10,
      color_precision: 6,
      layer_difference: 24,
      corner_threshold: 60,
      length_threshold: 4.0,
      splice_threshold: 45,
      path_precision: 8,
    },
  },
  {
    id: "posterized",
    label: "Posterized",
    description:
      "Flat, punchy, reduced palette for a stylized poster look.",
    settings: {
      colormode: "color",
      hierarchical: "cutout",
      mode: "spline",
      filter_speckle: 6,
      color_precision: 3,
      layer_difference: 48,
      corner_threshold: 60,
      length_threshold: 4.0,
      splice_threshold: 45,
      path_precision: 8,
    },
  },
  {
    id: "pixel-art",
    label: "Pixel Art",
    description:
      "Preserves crisp pixel edges. No curve fitting, no speckle removal.",
    settings: {
      colormode: "color",
      hierarchical: "stacked",
      mode: "polygon",
      filter_speckle: 0,
      color_precision: 8,
      layer_difference: 16,
      corner_threshold: 60,
      length_threshold: 4.0,
      splice_threshold: 45,
      path_precision: 8,
    },
  },
  {
    id: "binary-silhouette",
    label: "Binary Silhouette",
    description:
      "Monochrome VTracer output. Closest in spirit to Potrace.",
    settings: {
      colormode: "binary",
      hierarchical: "cutout",
      mode: "spline",
      filter_speckle: 4,
      color_precision: 6,
      layer_difference: 16,
      corner_threshold: 60,
      length_threshold: 4.0,
      splice_threshold: 45,
      path_precision: 8,
    },
  },
]
