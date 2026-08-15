# IconForge

## What It Does
IconForge removes backgrounds from images and converts them to icon-ready formats. Output options: WebP, monochrome silhouette SVG (Potrace), color multi-path SVG via VTracer (fast), or color SVG via an AA-aware preprocessor + per-color Potrace (precision). Ships with both a CLI and a web UI.

## Data Flow
The web UI is **service-based**: each pipeline is an independent workflow, all batch-first (multi-select N images → run → per-image status → download).

```
assets/input_images/  ←── upload via UI, or drop files in directly
        │                 (optional per-image crop writes <stem>_cropped.png back here)
        │
        ├── Background Removal ──→ output/background_removed/   (transparent PNGs)
        ├── Silhouette SVG* ─────→ output/silhouette/           (monochrome SVG, Potrace)
        ├── Color SVG ───────────→ output/color_svg/            (VTracer "fast" or AA-aware "precision" engine)
        └── WebP Convert ────────→ output/webp/                 (+ Download-All-as-ZIP)

* Silhouette traces the alpha channel — source from output/background_removed/
  (or input images that already have transparency).
```

Services chain through the folders: the SVG and WebP services can source from `output/background_removed/` as well as the input folder. An **Outputs** tab browses all four output folders with download/delete. Input images can also be deleted from the UI. (The CLI still writes to the legacy `backend/background_remover/output/`.)

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
│       ├── App.tsx                   # Service nav + global AppSettings state
│       ├── components/
│       │   ├── ui/                   # shadcn/ui: badge, button, card, collapsible, progress, select, separator, slider, switch
│       │   ├── services/             # BackgroundRemovalService, SilhouetteService, ColorSVGService, WebPService (thin ServicePage wrappers)
│       │   ├── settings/             # Per-engine settings panels (sliders/selects + preset pills)
│       │   ├── outputs/              # OutputsBrowser — tabbed browser of output/ folders
│       │   ├── shared/               # ServicePage (generic batch runner), ImagePicker, ImageCropper, BgModelPicker, DropZone, ImagePreview
│       │   └── layout/               # AppLayout (header + service nav)
│       ├── services/api.ts           # Typed fetch calls to backend
│       ├── utils/imageUtils.ts       # snapToGrid, snapDimensions, getImageDimensions, formatFileSize
│       ├── lib/utils.ts              # cn() — clsx + tailwind-merge helper
│       └── types/index.ts            # Shared TypeScript interfaces
├── assets/input_images/              # User input folder (upload target; delete & crop from the UI)
├── output/                           # Service outputs (gitignored): background_removed/, silhouette/, color_svg/, webp/
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
| upload.py      | `POST /api/upload` (auto 8px snap, saves to input folder)                                     |
| crop.py        | `POST /api/crop` (enforces 8px grid; writes cropped copy back to input folder)                |
| background.py  | `GET /api/background/models`, `POST /api/background/process` (→ output/background_removed)    |
| svg.py           | `GET /api/svg/check-potrace`, `POST /api/svg/convert`                                                 |
| color_svg.py     | `GET /api/color-svg/check-vtracer`, `POST /api/color-svg/convert`                                     |
| potrace_color.py | `GET /api/potrace-color/check`, `POST /api/potrace-color/convert`                                     |
| export.py        | `POST /api/export/webp` (quality 1–100, saves to output/webp, returns JSON), `POST /api/export/zip` (ZIP of output/webp files) |
| images.py        | `GET /api/images/{directory}` (list), `GET/DELETE /api/images/{directory}/{filename}`; directory ∈ input, background_removed, silhouette, color_svg, webp |
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
2. All dimensions are **divisible by 8** (enforced at upload and crop via `backend/core/image_utils.py`; the WebP converter floors to /8 for images that skipped both)
3. Vector outputs are **SVG** — monochrome silhouette (Potrace), fast color multi-path (VTracer), or AA-aware precision color (upscale + edge-preserving smooth + per-color Potrace)
4. Background removal is **its own service**, not a prerequisite — SVG and WebP services can consume raw input images directly (useful for logos with intended backdrops). Silhouette SVG is the exception: it traces the alpha channel, so opaque images should go through Background Removal first
5. Every service run writes its results to `output/<kind>/` — downloads are conveniences, the folder is the source of truth

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
