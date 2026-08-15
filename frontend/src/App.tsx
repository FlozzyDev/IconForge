import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { BackgroundRemovalService } from "@/components/services/BackgroundRemovalService"
import { SilhouetteService } from "@/components/services/SilhouetteService"
import { ColorSVGService } from "@/components/services/ColorSVGService"
import { WebPService } from "@/components/services/WebPService"
import { OutputsBrowser } from "@/components/outputs/OutputsBrowser"
import type { AppSettings, ServiceId } from "@/types"

const DEFAULT_SETTINGS: AppSettings = {
  webpQuality: 90,
  colorEngine: "fast",
  bgSettings: {
    modelType: "rembg",
    modelName: "bria-rmbg",
    mode: "base",
  },
  svgSettings: {
    threshold: 128,
    turdsize: 2,
    alphamax: 1.0,
    opttolerance: 0.2,
    longcurve: false,
    scale: 1.0,
  },
  colorSVGSettings: {
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
  potraceColorSettings: {
    n_colors: 8,
    upscale_factor: 3,
    smoothing: "mean_shift",
    smooth_spatial_radius: 15,
    smooth_color_radius: 20,
    alpha_threshold: 128,
    min_region_pixels: 32,
    merge_color_distance: 10,
    mask_cleanup: true,
    turdsize: 2,
    alphamax: 1.0,
    opttolerance: 0.2,
    longcurve: false,
  },
}

export default function App() {
  const [active, setActive] = useState<ServiceId>("background")
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Every service stays mounted so selections, results, and in-flight runs
  // survive tab switches; only the active one is visible.
  const services: { id: ServiceId; node: React.ReactNode }[] = [
    {
      id: "background",
      node: (
        <BackgroundRemovalService
          settings={settings}
          onSettingsChange={setSettings}
        />
      ),
    },
    {
      id: "silhouette",
      node: (
        <SilhouetteService settings={settings} onSettingsChange={setSettings} />
      ),
    },
    {
      id: "colorSvg",
      node: (
        <ColorSVGService settings={settings} onSettingsChange={setSettings} />
      ),
    },
    {
      id: "webp",
      node: <WebPService settings={settings} onSettingsChange={setSettings} />,
    },
    { id: "outputs", node: <OutputsBrowser /> },
  ]

  return (
    <AppLayout active={active} onNavigate={setActive}>
      {services.map(({ id, node }) => (
        <div key={id} hidden={id !== active}>
          {node}
        </div>
      ))}
    </AppLayout>
  )
}
