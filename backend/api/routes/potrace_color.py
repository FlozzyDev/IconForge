from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.api.dependencies import (
    get_input_dir,
    get_output_subdir,
    safe_filename,
    processing_lock,
)

router = APIRouter()


class ConvertRequest(BaseModel):
    image: str
    settings: Optional[dict] = None


@router.get("/check")
async def check_potrace_color():
    """Check if Potrace is available for the color-precision engine."""
    from backend.potrace_color_converter.processor import PotraceColorConverter

    return {"available": PotraceColorConverter().check_potrace()}


@router.post("/convert")
async def convert_to_potrace_color(req: ConvertRequest):
    """Convert an image to a layered color SVG via AA-aware preprocessing +
    per-color Potrace tracing. Sources from the input folder first, then the
    background-removed outputs."""
    filename = safe_filename(req.image)
    image_path = get_input_dir() / filename
    if not image_path.exists():
        image_path = get_output_subdir("background_removed") / filename
    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")

    with processing_lock:
        try:
            from backend.potrace_color_converter.processor import PotraceColorConverter

            converter = PotraceColorConverter()
            converter.output_dir = get_output_subdir("color_svg")
            output_path = converter.convert(image_path, settings=req.settings)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    return {"filename": output_path.name}
