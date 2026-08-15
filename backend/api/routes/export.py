from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from pathlib import Path
from PIL import Image
import io
import zipfile

from backend.api.dependencies import (
    get_input_dir,
    get_output_subdir,
    safe_filename,
)

router = APIRouter()


class WebPExportRequest(BaseModel):
    image: str
    quality: int = 90


class BatchZipRequest(BaseModel):
    images: list[str]


def _to_webp_bytes(image_path: Path, quality: int) -> bytes:
    """Encode an image as WebP, flooring dimensions to multiples of 8."""
    img = Image.open(image_path)
    w, h = img.size
    new_w = (w // 8) * 8
    new_h = (h // 8) * 8
    if new_w != w or new_h != h:
        img = img.resize((new_w, new_h), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=quality)
    return buf.getvalue()


@router.post("/webp")
async def export_webp(req: WebPExportRequest):
    """Convert an image to WebP into output/webp/. Sources from the input
    folder first, then the background-removed outputs."""
    if not 1 <= req.quality <= 100:
        raise HTTPException(status_code=400, detail="Quality must be 1-100")

    filename = safe_filename(req.image)
    image_path = get_input_dir() / filename
    if not image_path.exists():
        image_path = get_output_subdir("background_removed") / filename
    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")

    try:
        webp_bytes = _to_webp_bytes(image_path, req.quality)

        webp_filename = f"{Path(filename).stem}.webp"
        webp_path = get_output_subdir("webp") / webp_filename
        webp_path.write_bytes(webp_bytes)

        with Image.open(webp_path) as img:
            w, h = img.size
        return {"filename": webp_filename, "width": w, "height": h}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WebP export failed: {e}")


@router.post("/zip")
async def export_zip(req: BatchZipRequest):
    """Bundle already-converted files from output/webp/ into a ZIP download."""
    if not req.images:
        raise HTTPException(status_code=400, detail="No images provided")

    webp_dir = get_output_subdir("webp")
    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in req.images:
            filename = safe_filename(name)
            file_path = webp_dir / filename
            if not file_path.exists():
                raise HTTPException(
                    status_code=404, detail=f"Image not found: {filename}"
                )
            zf.write(file_path, arcname=filename)

    return Response(
        content=buffer.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="iconforge_export.zip"'
        },
    )
