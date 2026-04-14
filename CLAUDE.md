# IconForge

## What It Does
IconForge removes backgrounds from images and converts them to icon-ready formats (WebP, SVG silhouettes). It has both a CLI and a web UI.

## Data Flow
```
Upload image → Crop (8px grid snap) → Background Removal → Export as WebP
                                     → Silhouette (Potrace) → Export as SVG
```

## Project Structure
```
iconforge/
├── backend/                          # Python backend
│   ├── __init__.py
│   ├── main.py                       # CLI menu
│   ├── background_remover/
│   │   ├── processor.py              # BackgroundProcessor — 15 rembg models + InSPyReNet
│   │   └── output/                   # Processed images
│   ├── svg_converter/
│   │   ├── processor.py              # SVGConverter — alpha→B&W→Potrace→SVG
│   │   └── settings.py               # SVGSettings — 6 tunable parameters
│   ├── api/                          # FastAPI backend
│   │   ├── app.py                    # App creation, CORS, static mount, serve()
│   │   ├── dependencies.py           # Shared paths, processing lock
│   │   └── routes/                   # upload, crop, background, svg, export, images, settings
│   └── core/
│       └── utils.py                  # loading_animation() utility
├── frontend/                         # React SPA (Vite + TypeScript + Tailwind + shadcn/ui)
│   └── src/
│       ├── App.tsx                   # 5-step wizard state machine
│       ├── components/
│       │   ├── ui/                   # shadcn/ui components (button, card, slider, etc.)
│       │   ├── steps/                # UploadStep, OptionsStep, ProcessingStep, CompareStep, ExportStep
│       │   ├── shared/               # ImageCropper, DropZone, ImagePreview, SettingsPanel, StepIndicator
│       │   └── layout/               # WizardLayout
│       ├── hooks/                    # useWizard, useApi
│       ├── services/api.ts           # Typed fetch calls to backend
│       ├── utils/imageUtils.ts       # snapToGrid, dimension helpers
│       └── types/index.ts            # Shared TypeScript interfaces
├── assets/input_images/              # User input folder
├── pyproject.toml                    # Python dependency list
├── svg_settings.json                 # Persisted SVG settings
└── .env                              # POTRACE_PATH
```

## Tech Stack
- **Backend:** Python 3.13, FastAPI, PyTorch + CUDA, rembg, transparent-background, Potrace, Pillow
- **Frontend:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, shadcn/ui, react-easy-crop, react-dropzone
- **Package managers:** uv (Python), pnpm (Node)

## How to Run
```bash
# Terminal 1 — Backend (from project root)
.venv\Scripts\uvicorn backend.api.app:app --reload

# Terminal 2 — Frontend
cd frontend && pnpm dev

# Open http://localhost:5173
```

## Output Rules
1. All image exports (non-silhouette) are **WebP** format
2. All dimensions are **divisible by 8** (enforced at crop)
3. Silhouette output is **SVG**
