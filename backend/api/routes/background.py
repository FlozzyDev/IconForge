from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

from backend.api.dependencies import (
    get_input_dir,
    get_output_dir,
    safe_filename,
    processing_lock,
)

router = APIRouter()


class ProcessRequest(BaseModel):
    image: str
    model_type: str  # "rembg" or "inspyrenet"
    model_name: str = "bria-rmbg"
    mode: str = "base"  # for inspyrenet


@router.get("/models")
async def list_models():
    """List available background removal models."""
    import rembg.sessions

    return {
        "rembg": list(rembg.sessions.sessions_names),
        "inspyrenet": ["base", "fast"],
    }


@router.post("/process")
async def process_background(req: ProcessRequest):
    """Remove background from an image."""
    filename = safe_filename(req.image)

    # Check input dir then output dir (for cropped images)
    image_path = get_input_dir() / filename
    if not image_path.exists():
        image_path = get_output_dir() / filename
    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")

    with processing_lock:
        try:
            from backend.background_remover.processor import BackgroundProcessor

            processor = BackgroundProcessor()
            output_path = processor.process(
                image_path,
                model_type=req.model_type,
                model_name=req.model_name,
                mode=req.mode,
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    img = Image.open(output_path)
    w, h = img.size

    return {"filename": output_path.name, "width": w, "height": h}
