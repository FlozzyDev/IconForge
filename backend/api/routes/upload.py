from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io

from backend.api.dependencies import get_input_dir, safe_filename
from backend.core.image_utils import snap_image_to_grid

router = APIRouter()


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image, resampling to the nearest lower multiple of 8 on each axis."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    input_dir = get_input_dir()
    input_dir.mkdir(parents=True, exist_ok=True)

    filename = safe_filename(file.filename or "upload.png")
    file_path = input_dir / filename

    contents = await file.read()

    try:
        img = Image.open(io.BytesIO(contents))
        img.load()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    try:
        img = snap_image_to_grid(img)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    img.save(file_path)
    w, h = img.size
    return {"filename": filename, "width": w, "height": h}
