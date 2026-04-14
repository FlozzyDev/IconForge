from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes import background, crop, export, images, svg, upload
from backend.api.routes import settings


def create_app() -> FastAPI:
    app = FastAPI(title="IconForge API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API routes
    app.include_router(upload.router, prefix="/api", tags=["upload"])
    app.include_router(crop.router, prefix="/api", tags=["crop"])
    app.include_router(background.router, prefix="/api/background", tags=["background"])
    app.include_router(svg.router, prefix="/api/svg", tags=["svg"])
    app.include_router(export.router, prefix="/api/export", tags=["export"])
    app.include_router(images.router, prefix="/api/images", tags=["images"])
    app.include_router(settings.router, prefix="/api/settings", tags=["settings"])

    # Serve frontend static files (production build)
    dist_dir = Path(__file__).parent.parent.parent.parent / "frontend" / "dist"
    if dist_dir.exists():
        app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="web")

    return app


app = create_app()


def serve():
    """Entry point for `iconforge-web` command."""
    import uvicorn

    print("Starting IconForge Web UI at http://localhost:8000")
    print("Make sure to run the React dev server: cd frontend && npm run dev")
    uvicorn.run(app, host="127.0.0.1", port=8000)


if __name__ == "__main__":
    serve()
