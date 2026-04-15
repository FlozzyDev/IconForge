from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.api.dependencies import get_output_dir, safe_filename, processing_lock

router = APIRouter()


class ConvertRequest(BaseModel):
    image: str
    settings: Optional[dict] = None


@router.get("/check-vtracer")
async def check_vtracer():
    """Check if vtracer is importable."""
    from backend.color_svg_converter.processor import ColorSVGConverter

    return {"available": ColorSVGConverter.check_vtracer()}


@router.post("/convert")
async def convert_to_color_svg(req: ConvertRequest):
    """Convert a background-removed image to a colored multi-path SVG via VTracer."""
    filename = safe_filename(req.image)
    image_path = get_output_dir() / filename

    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")

    with processing_lock:
        try:
            from backend.color_svg_converter.processor import ColorSVGConverter

            converter = ColorSVGConverter()
            output_path = converter.convert(image_path, settings=req.settings)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    return {"filename": output_path.name}
