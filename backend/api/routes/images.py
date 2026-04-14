from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from PIL import Image

from backend.api.dependencies import get_input_dir, get_output_dir, safe_filename

router = APIRouter()

DIRECTORY_MAP = {
    "input": get_input_dir,
    "output": get_output_dir,
}


@router.get("/input")
async def list_input_images():
    """List images in the input directory."""
    return _list_images(get_input_dir())


@router.get("/output")
async def list_output_images():
    """List images in the output directory."""
    return _list_images(get_output_dir())


@router.get("/{directory}/{filename}")
async def serve_image(directory: str, filename: str):
    """Serve an image file for preview."""
    dir_fn = DIRECTORY_MAP.get(directory)
    if not dir_fn:
        raise HTTPException(status_code=400, detail=f"Invalid directory: {directory}")

    safe_name = safe_filename(filename)
    file_path = dir_fn() / safe_name

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    # Determine media type
    suffix = file_path.suffix.lower()
    media_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".bmp": "image/bmp",
    }
    media_type = media_types.get(suffix, "application/octet-stream")

    return FileResponse(path=str(file_path), media_type=media_type)


@router.delete("/{directory}/{filename}")
async def delete_image(directory: str, filename: str):
    """Delete an output image."""
    if directory != "output":
        raise HTTPException(status_code=403, detail="Can only delete output images")

    safe_name = safe_filename(filename)
    file_path = get_output_dir() / safe_name

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    file_path.unlink()
    return {"deleted": safe_name}


def _list_images(directory):
    """List image files in a directory with metadata."""
    if not directory.exists():
        return []

    image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".svg"}
    images = []

    for f in sorted(directory.iterdir()):
        if f.is_file() and f.suffix.lower() in image_extensions:
            info = {"filename": f.name, "size": f.stat().st_size}

            # Get dimensions for raster images
            if f.suffix.lower() != ".svg":
                try:
                    img = Image.open(f)
                    info["width"], info["height"] = img.size
                except Exception:
                    pass

            images.append(info)

    return images
