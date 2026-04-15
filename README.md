# IconForge

IconForge is a background-removal and image-to-vector tool for designers. Drop in a logo, photo, or AI-generated asset, crop it, strip the background, and export as a clean **WebP**, a **monochrome silhouette SVG** (via Potrace), or a **color multi-path SVG** (via VTracer) that opens directly in Figma or Illustrator with editable, per-color shapes.

Ships with both a web UI (React + FastAPI) and a CLI.

**Demo:** [YouTube walkthrough](https://www.youtube.com/watch?v=kLyfFY8sXuQ) *(pre-color-SVG version)*

---

## Features

- **Background removal** using 17 `rembg` models or `InSPyReNet` (base/fast modes) for state-of-the-art cutouts
- **Silhouette SVG** via Potrace — clean monochrome outlines, ideal for icons
- **Color SVG** via VTracer — multi-path colored vectors with each palette color as a separately editable shape
- **8-pixel grid enforcement** on all raster outputs — no sub-pixel alignment issues in downstream tools
- **Web UI** — 5-step wizard (upload → crop → background removal → output type → export)
- **CLI** — same pipelines exposed via an interactive menu

## Pipeline

```
Upload → Crop (8px snap) → Background Removal (mandatory)
            ↓
  choose ONE output:  WebP  |  Silhouette SVG  |  Color SVG  →  Export
```

---

## Prerequisites

- **Python ≥3.10** (3.13 recommended)
- **Node.js ≥20** with `pnpm`
- **[uv](https://docs.astral.sh/uv/)** for Python env management
- **Potrace** binary — required only for silhouette SVG output
- **NVIDIA GPU + CUDA 12.8 toolkit** (recommended) — background removal falls back to CPU without it, but will be much slower
- **~10 GB disk** for AI model cache (first-run downloads)

### Installing Potrace

- **Windows:** Download from the [official site](http://potrace.sourceforge.net/), extract to `C:\Tools\potrace-1.16.win64\`. If placed elsewhere, set `POTRACE_PATH` in `.env`.
- **macOS:** `brew install potrace`
- **Debian/Ubuntu:** `sudo apt-get install potrace`

---

## Setup

```bash
# 1. Clone
git clone <repository-url>
cd IconForge

# 2. Install Python dependencies (creates .venv automatically)
uv sync

# 3. Install frontend dependencies
cd frontend && pnpm install && cd ..

# 4. (Optional) Configure Potrace path if not at the default location
echo 'POTRACE_PATH="C:/path/to/potrace.exe"' > .env
```

AI models download on first use into `~/.cache/` (the `bria-rmbg` and `birefnet-general` models are the recommended starting pair).

---

## Running

**Web UI** (two terminals):

```bash
# Terminal 1 — backend on :8000
uv run uvicorn backend.api.app:app --reload

# Terminal 2 — frontend on :5173
cd frontend && pnpm dev
```

Open <http://localhost:5173>.

**CLI:**

```bash
uv run python -m backend.main
```

---

## Architecture

See [`CLAUDE.md`](./CLAUDE.md) for the full project map — module layout, API endpoints, and data flow.

- **Backend:** FastAPI, PyTorch + CUDA, rembg, transparent-background, Potrace, VTracer
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui
- **Package managers:** `uv` (Python), `pnpm` (Node)

---

## Credits

IconForge stands on the work of several open-source projects:

- [rembg](https://github.com/danielgatis/rembg) — background-removal model hub
- [transparent-background (InSPyReNet)](https://github.com/plemeri/transparent-background) — high-quality salient-object segmentation
- [Potrace](https://potrace.sourceforge.net/) — bitmap-to-vector tracing (monochrome)
- [VTracer](https://github.com/visioncortex/vtracer) — color raster-to-vector conversion

## License

MIT.
