from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from PIL import Image

from backend.api.dependencies import (
    OUTPUT_KINDS,
    get_input_dir,
    get_output_subdir,
    safe_filename,
)

router = APIRouter()


def _resolve_dir(directory: str):
    """Map a directory name to its path, or raise 400."""
    if directory == "input":
        return get_input_dir()
    if directory in OUTPUT_KINDS:
        return get_output_subdir(directory)
    raise HTTPException(status_code=400, detail=f"Invalid directory: {directory}")


@router.get("/{directory}")
async def list_images(directory: str):
    """List images in a directory (input or one of the output kinds)."""
    return _list_images(_resolve_dir(directory))


@router.get("/{directory}/{filename}")
async def serve_image(directory: str, filename: str):
    """Serve an image file for preview."""
    safe_name = safe_filename(filename)
    file_path = _resolve_dir(directory) / safe_name

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
    """Delete an image from the input folder or any output folder."""
    safe_name = safe_filename(filename)
    file_path = _resolve_dir(directory) / safe_name

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
