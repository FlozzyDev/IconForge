import type { PotraceColorSettings } from "@/types"

export interface PotraceColorPreset {
  id: string
  label: string
  description: string
  settings: PotraceColorSettings
}

export const POTRACE_COLOR_PRESETS: PotraceColorPreset[] = [
  {
    id: "defaults",
    label: "Defaults",
    description: "Balanced — 8 colors, 3\u00d7 upscale, mean-shift smoothing.",
    settings: {
      n_colors: 8,
      upscale_factor: 3,
      smoothing: "mean_shift",
      smooth_spatial_radius: 15,
      smooth_color_radius: 20,
      alpha_threshold: 128,
      min_region_pixels: 32,
      turdsize: 2,
      alphamax: 1.0,
      opttolerance: 0.2,
      longcurve: true,
    },
  },
  {
    id: "high-fidelity-logo",
    label: "High-Fidelity Logo",
    description: "Fewer colors, 4\u00d7 upscale for sharpest edges. Slowest.",
    settings: {
      n_colors: 6,
      upscale_factor: 4,
      smoothing: "mean_shift",
      smooth_spatial_radius: 12,
      smooth_color_radius: 18,
      alpha_threshold: 128,
      min_region_pixels: 48,
      turdsize: 2,
      alphamax: 1.2,
      opttolerance: 0.2,
      longcurve: true,
    },
  },
  {
    id: "photo-reduced",
    label: "Photo Reduced",
    description: "Larger palette at 2\u00d7 upscale with aggressive smoothing.",
    settings: {
      n_colors: 12,
      upscale_factor: 2,
      smoothing: "mean_shift",
      smooth_spatial_radius: 25,
      smooth_color_radius: 30,
      alpha_threshold: 128,
      min_region_pixels: 64,
      turdsize: 4,
      alphamax: 1.0,
      opttolerance: 0.3,
      longcurve: true,
    },
  },
  {
    id: "fast-test",
    label: "Fast Test",
    description: "No upscale, bilateral smoothing. Use to iterate quickly.",
    settings: {
      n_colors: 6,
      upscale_factor: 1,
      smoothing: "bilateral",
      smooth_spatial_radius: 10,
      smooth_color_radius: 20,
      alpha_threshold: 128,
      min_region_pixels: 16,
      turdsize: 2,
      alphamax: 1.0,
      opttolerance: 0.2,
      longcurve: true,
    },
  },
  {
    id: "posterized",
    label: "Posterized",
    description: "4-color punchy flat look. Great for stylized output.",
    settings: {
      n_colors: 4,
      upscale_factor: 3,
      smoothing: "mean_shift",
      smooth_spatial_radius: 20,
      smooth_color_radius: 30,
      alpha_threshold: 128,
      min_region_pixels: 48,
      turdsize: 4,
      alphamax: 1.2,
      opttolerance: 0.3,
      longcurve: true,
    },
  },
]
