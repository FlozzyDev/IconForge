from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

from backend.api.dependencies import get_input_dir, get_output_dir, safe_filename
from backend.core.image_utils import ensure_file_on_grid, floor_to_grid

router = APIRouter()


class CropRequest(BaseModel):
    filename: str
    x: int
    y: int
    width: int
    height: int


@router.post("/crop")
async def crop_image(req: CropRequest):
    """Crop an image, coercing all dimensions to multiples of 8."""
    filename = safe_filename(req.filename)

    input_path = get_input_dir() / filename
    if not input_path.exists():
        input_path = get_output_dir() / filename
    if not input_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")

    img_w, img_h = ensure_file_on_grid(input_path)

    x = max(0, floor_to_grid(req.x))
    y = max(0, floor_to_grid(req.y))
    w = floor_to_grid(req.width)
    h = floor_to_grid(req.height)
    if x + w > img_w:
        w = floor_to_grid(img_w - x)
    if y + h > img_h:
        h = floor_to_grid(img_h - y)
    if w < 8 or h < 8:
        raise HTTPException(
            status_code=400,
            detail=f"Crop region too small after grid snap ({w}x{h})",
        )

    with Image.open(input_path) as img:
        cropped = img.crop((x, y, x + w, y + h))
        output_dir = get_output_dir()
        output_dir.mkdir(parents=True, exist_ok=True)
        output_filename = f"{input_path.stem}_cropped.png"
        output_path = output_dir / output_filename
        cropped.save(output_path)

    return {
        "filename": output_filename,
        "width": w,
        "height": h,
    }
