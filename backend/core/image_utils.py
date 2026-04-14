from pathlib import Path
from PIL import Image

GRID = 8


def floor_to_grid(value: int, grid: int = GRID) -> int:
    return (value // grid) * grid


def snap_image_to_grid(img: Image.Image, grid: int = GRID) -> Image.Image:
    """Return an image whose width and height are both multiples of `grid`.

    If the image already satisfies the constraint, it is returned unchanged.
    Otherwise it is resampled down (LANCZOS) to the nearest lower multiple.
    """
    w, h = img.size
    tw, th = floor_to_grid(w, grid), floor_to_grid(h, grid)
    if tw < grid or th < grid:
        raise ValueError(f"Image too small to snap to {grid}px grid ({w}x{h})")
    if (tw, th) == (w, h):
        return img
    return img.resize((tw, th), Image.LANCZOS)


def ensure_file_on_grid(path: Path, grid: int = GRID) -> tuple[int, int]:
    """Open the file at `path`, snap it to the grid if needed, save in place.

    Returns the final (width, height).
    """
    with Image.open(path) as img:
        img.load()
        snapped = snap_image_to_grid(img, grid)
        if snapped is not img:
            snapped.save(path)
        return snapped.size
