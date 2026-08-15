import threading
from pathlib import Path
from functools import lru_cache


# Serialize GPU-bound processing to prevent CUDA OOM
processing_lock = threading.Lock()

# Output subfolder per service output type
OUTPUT_KINDS = ("background_removed", "silhouette", "color_svg", "webp")


@lru_cache()
def get_project_root() -> Path:
    return Path(__file__).parent.parent.parent


def get_input_dir() -> Path:
    return get_project_root() / "assets" / "input_images"


def get_output_root() -> Path:
    return get_project_root() / "output"


def get_output_subdir(kind: str) -> Path:
    if kind not in OUTPUT_KINDS:
        raise ValueError(f"Unknown output kind: {kind}")
    path = get_output_root() / kind
    path.mkdir(parents=True, exist_ok=True)
    return path


def safe_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal."""
    return Path(filename).name
