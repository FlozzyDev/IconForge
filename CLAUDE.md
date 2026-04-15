# IconForge

## What It Does
IconForge removes backgrounds from images and converts them to icon-ready formats. Output options: WebP, monochrome silhouette SVG (Potrace), color multi-path SVG via VTracer (fast), or color SVG via an AA-aware preprocessor + per-color Potrace (precision). Ships with both a CLI and a web UI.

## Data Flow
```
Upload image → Crop (8px grid snap) → Background Removal (optional — can be skipped)
                ↓
     pick ONE output type:
       WebP | Silhouette SVG* | Color SVG (VTracer) | Color SVG (Precision)
                ↓
     Process → Export

* Silhouette SVG requires background removal (it traces the alpha channel).
  Disabled with a tooltip if the user skips BG removal.
```

All downstream pipelines consume either the BG-removed PNG or, when skipped, the cropped PNG directly — both live in `backend/background_remover/output/`.

## Project Structure
```
iconforge/
├── backend/                          # Python backend
│   ├── __init__.py
│   ├── main.py                       # CLI menu (preloads onnxruntime DLLs)
│   ├── background_remover/
│   │   ├── processor.py              # BackgroundProcessor — 17 rembg models + InSPyReNet (base/fast via transparent-background)
│   │   └── output/                   # Processed images
│   ├── svg_converter/
│   │   ├── processor.py              # SVGConverter — alpha→B&W→Potrace→SVG (monochrome silhouette)
│   │   └── settings.py               # SVGSettings — 6 tunable parameters (threshold, turdsize, alphamax, opttolerance, longcurve, scale)
│   ├── color_svg_converter/
│   │   ├── processor.py              # ColorSVGConverter — wraps vtracer.convert_image_to_svg_py (multi-path colored SVG)
│   │   └── settings.py               # ColorSVGSettings — 10 vtracer params (colormode, hierarchical, mode, filter_speckle, color_precision, layer_difference, corner/length/splice_threshold, path_precision)
│   ├── potrace_color_converter/      # AA-aware precision color engine
│   │   ├── processor.py              # PotraceColorConverter — upscale + edge-preserving smooth + k-means + N*Potrace
│   │   ├── preprocess.py             # upscale_rgba, edge_preserving_smooth (mean-shift/bilateral), quantize_lab (Lab k-means)
│   │   ├── potrace_runner.py         # trace_mask() — runs potrace on one binary mask, extracts <path d="...">
│   │   ├── svg_composer.py           # compose_svg() — layered SVG with biggest-first stacking + scale(1/upscale)
│   │   └── settings.py               # PotraceColorSettings — 11 params (n_colors, upscale_factor, smoothing, radii, Potrace passthroughs)
│   ├── api/                          # FastAPI backend
│   │   ├── app.py                    # App creation, CORS, static mount, serve()
│   │   ├── dependencies.py           # Shared paths, processing_lock, safe_filename() path-traversal guard
│   │   └── routes/                   # upload, crop, background, svg, color_svg, potrace_color, export, images, settings
│   └── core/
│       ├── utils.py                  # loading_animation() utility
│       └── image_utils.py            # floor_to_grid, snap_image_to_grid, ensure_file_on_grid (8px enforcement)
├── frontend/                         # React SPA (Vite + TypeScript + Tailwind + shadcn/ui)
│   └── src/
│       ├── App.tsx                   # 5-step wizard state machine (Upload → BG Removal → Output Type → Processing → Export)
│       ├── components/
│       │   ├── ui/                   # shadcn/ui: badge, button, card, collapsible, progress, select, separator, slider, switch
│       │   ├── steps/                # UploadStep, BackgroundRemovalStep, OutputTypeStep, ProcessingStep, ExportStep
│       │   ├── shared/               # ImageCropper (custom, vanilla React), DropZone, ImagePreview, SettingsPanel, StepIndicator
│       │   └── layout/               # WizardLayout
│       ├── hooks/                    # useWizard (useApi scaffolded but unused)
│       ├── services/api.ts           # Typed fetch calls to backend
│       ├── utils/imageUtils.ts       # snapToGrid, snapDimensions, getImageDimensions, formatFileSize
│       ├── lib/utils.ts              # cn() — clsx + tailwind-merge helper
│       └── types/index.ts            # Shared TypeScript interfaces
├── assets/input_images/              # User input folder
├── pyproject.toml                    # Python dependency list
├── svg_settings.json                 # Persisted silhouette (Potrace) settings
├── color_svg_settings.json           # Persisted color SVG (VTracer) settings
├── potrace_color_settings.json       # Persisted color SVG (Precision / Potrace) settings
└── .env                              # POTRACE_PATH
```

## Tech Stack
- **Backend:** Python ≥3.10 (3.13 in dev), FastAPI, PyTorch + CUDA, rembg, transparent-background, Potrace, vtracer (MIT, Rust via PyO3), Pillow, onnxruntime
- **Frontend:** React 19, TypeScript ~6, Vite 8, Tailwind CSS 4, shadcn/ui, @base-ui/react, react-dropzone, lucide-react, class-variance-authority, clsx, tailwind-merge, tw-animate-css, @fontsource-variable/geist
- **Package managers:** uv (Python), pnpm (Node)

## API Endpoints
Frontend proxies `/api` → `http://127.0.0.1:8000` (configured in `vite.config`).

| Route file     | Endpoints                                                                                     |
|----------------|-----------------------------------------------------------------------------------------------|
| upload.py      | `POST /api/upload` (auto 8px snap)                                                            |
| crop.py        | `POST /api/crop` (enforces 8px grid)                                                          |
| background.py  | `GET /api/background/models`, `POST /api/background/process`                                  |
| svg.py           | `GET /api/svg/check-potrace`, `POST /api/svg/convert`                                                 |
| color_svg.py     | `GET /api/color-svg/check-vtracer`, `POST /api/color-svg/convert`                                     |
| potrace_color.py | `GET /api/potrace-color/check`, `POST /api/potrace-color/convert`                                     |
| export.py        | `POST /api/export/webp` (quality 1–100, returns FileResponse)                                         |
| images.py        | `GET/DELETE /api/images/{directory}/{filename}`, `GET /api/images/input`, `/api/images/output`         |
| settings.py      | `GET/PUT /api/settings/svg`, `GET/PUT /api/settings/color-svg`, `GET/PUT /api/settings/potrace-color` |

## How to Run
```bash
# Terminal 1 — Backend on :8000 (always via `uv run` to avoid venv trampoline issues on Windows)
uv run uvicorn backend.api.app:app --reload

# Terminal 2 — Frontend on :5173
cd frontend && pnpm dev

# Open http://localhost:5173
```

**CLI:** `uv run python -m backend.main`

## Dependency Management Rules
- Always use `uv` for Python, `pnpm` for Node.
- **Never run bare `uv add <pkg>`** — use `uv add <pkg> --frozen` to avoid re-resolving and accidentally downgrading CUDA torch or onnxruntime-gpu.
- `torch` and `torchvision` are pinned to CUDA 12.8 wheels via `[tool.uv.sources]` in `pyproject.toml` against the PyTorch index `https://download.pytorch.org/whl/cu128`.
- `uv.lock` is committed — `uv sync` reproduces the exact environment.
- If the venv gets into a bad state (trampoline canonicalization errors), recreate it: `rm -rf .venv && uv sync`.

## Output Rules
1. Raster exports are **WebP** format
2. All dimensions are **divisible by 8** (enforced at upload and crop via `backend/core/image_utils.py`)
3. Vector outputs are **SVG** — monochrome silhouette (Potrace), fast color multi-path (VTracer), or AA-aware precision color (upscale + edge-preserving smooth + per-color Potrace)
4. Background removal is **optional** — users can skip it to keep the original background (useful for logos with intended backdrops). When skipped, downstream pipelines use the cropped PNG directly. The only output type that *requires* BG removal is Silhouette SVG, because it traces the alpha channel
5. One output format per wizard run; re-run to produce another format from the same crop

## Per-Feature Documentation
Each major subsystem has its own `CLAUDE.md` with algorithm details, settings reference, and gotchas. Read the relevant one before modifying that subsystem.

| Subsystem | Doc |
|---|---|
| Background removal (rembg + InSPyReNet) | [`backend/background_remover/CLAUDE.md`](backend/background_remover/CLAUDE.md) |
| Silhouette SVG (Potrace, monochrome) | [`backend/svg_converter/CLAUDE.md`](backend/svg_converter/CLAUDE.md) |
| Color SVG — fast (VTracer) | [`backend/color_svg_converter/CLAUDE.md`](backend/color_svg_converter/CLAUDE.md) |
| Color SVG — precision (AA-aware + per-color Potrace) | [`backend/potrace_color_converter/CLAUDE.md`](backend/potrace_color_converter/CLAUDE.md) |
| FastAPI layer | [`backend/api/CLAUDE.md`](backend/api/CLAUDE.md) |
| React frontend (wizard) | [`frontend/CLAUDE.md`](frontend/CLAUDE.md) |
