from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.api.dependencies import get_output_dir, safe_filename, processing_lock

router = APIRouter()


class ConvertRequest(BaseModel):
    image: str
    settings: Optional[dict] = None


@router.get("/check-potrace")
async def check_potrace():
    """Check if Potrace is available."""
    from backend.svg_converter.processor import SVGConverter

    converter = SVGConverter()
    return {"available": converter._check_potrace()}


@router.post("/convert")
async def convert_to_svg(req: ConvertRequest):
    """Convert a background-removed image to SVG silhouette."""
    filename = safe_filename(req.image)
    image_path = get_output_dir() / filename

    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")

    with processing_lock:
        try:
            from backend.svg_converter.processor import SVGConverter

            converter = SVGConverter()
            output_path = converter.convert(image_path, settings=req.settings)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    return {"filename": output_path.name}
