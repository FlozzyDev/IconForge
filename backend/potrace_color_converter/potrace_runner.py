"""Runs Potrace on a single binary mask and returns the path data + transform.

Potrace's `-s` (SVG) output emits paths in its internal coordinate system, then
wraps them in a <g transform="translate(0,H) scale(0.1,-0.1)"> that maps back
to image pixel space (Potrace uses 10x internal precision and PostScript-style
bottom-up Y axis). We must preserve that transform per-call when composing the
final multi-color SVG, otherwise paths land off-canvas.
"""
import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Tuple

import numpy as np
from PIL import Image


# Match the wrapping <g transform="..."> emitted by Potrace's SVG mode.
_G_TRANSFORM_RE = re.compile(r'<g[^>]*\stransform="([^"]+)"', re.DOTALL)
_PATH_D_RE = re.compile(r'<path[^>]*\sd="([^"]+)"', re.DOTALL)


def trace_mask(
    mask: np.ndarray, potrace_path: Path, potrace_settings: dict, timeout: int = 30
) -> Optional[Tuple[str, str]]:
    """Run Potrace on a binary mask and return (path_d, transform).

    Args:
        mask: HxW bool or uint8 array. Truthy pixels become black in Potrace input.
        potrace_path: Path to potrace binary.
        potrace_settings: dict with turdsize, alphamax, opttolerance, longcurve.
        timeout: subprocess timeout in seconds.

    Returns:
        Tuple of (concatenated 'd' attribute, group 'transform' attribute), or
        None if Potrace produced no path. The transform must be applied in the
        composed SVG to map the path coordinates back to pixel space.
    """
    # Potrace: black (0) = foreground to trace, white (255) = background.
    mask_bool = mask.astype(bool)
    bw = np.where(mask_bool, 0, 255).astype(np.uint8)
    pil = Image.fromarray(bw, "L")

    with tempfile.NamedTemporaryFile(suffix=".pbm", delete=False) as tf:
        temp_in = tf.name
        pil.save(temp_in, "PPM")

    temp_out = temp_in + ".svg"
    try:
        cmd = [
            str(potrace_path),
            temp_in,
            "-s",
            "--turdsize",
            str(potrace_settings.get("turdsize", 2)),
            "--alphamax",
            str(potrace_settings.get("alphamax", 1.0)),
            "--opttolerance",
            str(potrace_settings.get("opttolerance", 0.2)),
            "-o",
            temp_out,
        ]
        if potrace_settings.get("longcurve", True):
            cmd.append("--longcurve")

        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout
        )
        if result.returncode != 0:
            raise RuntimeError(f"Potrace error: {result.stderr}")

        if not os.path.exists(temp_out):
            return None

        with open(temp_out, "r") as f:
            svg_text = f.read()

        d_matches = _PATH_D_RE.findall(svg_text)
        if not d_matches:
            return None

        transform_match = _G_TRANSFORM_RE.search(svg_text)
        # Potrace always emits the wrapping transform in -s mode; if missing,
        # fall back to identity rather than silently mis-rendering.
        transform = transform_match.group(1) if transform_match else ""

        return (" ".join(d_matches), transform)
    finally:
        for p in (temp_in, temp_out):
            try:
                if os.path.exists(p):
                    os.unlink(p)
            except OSError:
                pass
