# IconForge Setup

## Prerequisites
- Python 3.13+
- Node.js 24+
- pnpm
- uv
- Potrace binary at path specified in `.env`

## First-Time Setup

### Backend (from project root)
```bash
uv venv
uv pip install torch==2.7.1+cu128 torchvision==0.22.1+cu128 --extra-index-url https://download.pytorch.org/whl/cu128
uv pip install -r pyproject.toml
```

### Frontend
```bash
cd frontend
pnpm install
```

## Running

Two terminals, both from the **project root**.

### Terminal 1 — Backend (port 8000)
```bash
.venv\Scripts\uvicorn backend.api.app:app --reload
```

### Terminal 2 — Frontend (port 5173)
```bash
cd frontend
pnpm dev
```

### Open in browser
```
http://localhost:5173
```

## Troubleshooting

**`torch` install fails:** The CUDA build of PyTorch must be installed separately from `https://download.pytorch.org/whl/cu128`. See the backend setup command above.

**API not connecting:** Make sure the backend is running on port 8000 before starting the frontend. The frontend proxies `/api` requests to `http://127.0.0.1:8000`.

**Potrace not found:** Set `POTRACE_PATH` in `.env` to your Potrace executable path.
