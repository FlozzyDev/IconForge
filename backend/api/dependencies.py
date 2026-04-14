import threading
from pathlib import Path
from functools import lru_cache


# Serialize GPU-bound processing to prevent CUDA OOM
processing_lock = threading.Lock()


@lru_cache()
def get_project_root() -> Path:
    return Path(__file__).parent.parent.parent


def get_input_dir() -> Path:
    return get_project_root() / "assets" / "input_images"


def get_output_dir() -> Path:
    return get_project_root() / "backend" / "background_remover" / "output"


def safe_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal."""
    return Path(filename).name
