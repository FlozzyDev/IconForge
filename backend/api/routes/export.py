from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from PIL import Image
import tempfile

from backend.api.dependencies import get_output_dir, safe_filename

router = APIRouter()


class WebPExportRequest(BaseModel):
    image: str
    quality: int = 90


@router.post("/webp")
async def export_webp(req: WebPExportRequest):
    """Convert a processed image to WebP and return it for download."""
    if not 1 <= req.quality <= 100:
        raise HTTPException(status_code=400, detail="Quality must be 1-100")

    filename = safe_filename(req.image)
    image_path = get_output_dir() / filename

    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")

    try:
        img = Image.open(image_path)

        # Ensure dimensions are divisible by 8
        w, h = img.size
        new_w = (w // 8) * 8
        new_h = (h // 8) * 8
        if new_w != w or new_h != h:
            img = img.resize((new_w, new_h), Image.LANCZOS)

        webp_filename = f"{Path(filename).stem}.webp"
        webp_path = get_output_dir() / webp_filename
        img.save(webp_path, "WEBP", quality=req.quality)

        return FileResponse(
            path=str(webp_path),
            media_type="image/webp",
            filename=webp_filename,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WebP export failed: {e}")
