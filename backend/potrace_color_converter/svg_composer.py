"""Composes per-color Potrace paths into one layered SVG."""
from pathlib import Path
from typing import Iterable, Tuple


# Each path entry: (d_string, potrace_transform, (r, g, b), area_in_pixels)
PathEntry = Tuple[str, str, Tuple[int, int, int], int]


def compose_svg(
    paths: Iterable[PathEntry],
    original_width: int,
    original_height: int,
    upscale: int,
    output_path: Path,
) -> None:
    """Emit a single SVG with one <path> per color, stacked biggest-first.

    Each Potrace call returns:
      - a path 'd' string in Potrace's internal 10x, Y-flipped coordinate space
      - the wrapping <g transform="..."> that maps it back to pixel space (in the
        UPSCALED image's dimensions, because Potrace was given the upscaled mask)

    We wrap each path in its own <g> with that per-call transform, then wrap the
    whole set in an outer <g transform="scale(1/upscale)"> so the final SVG
    renders at the original (pre-upscale) dimensions. The viewBox uses the
    original size — downstream tools display at the source resolution while
    benefiting from the sub-pixel precision the upscale granted.
    """
    # Sort largest area first so bigger regions render underneath smaller ones.
    ordered = sorted(paths, key=lambda p: -p[3])

    lines = [
        '<?xml version="1.0" standalone="no"?>',
        (
            f'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '
            f'viewBox="0 0 {original_width} {original_height}" '
            f'width="{original_width}" height="{original_height}">'
        ),
    ]

    if upscale > 1:
        lines.append(f'<g transform="scale({1.0 / upscale})">')
    else:
        lines.append("<g>")

    for d, potrace_transform, (r, g, b), _area in ordered:
        fill = f'rgb({int(r)},{int(g)},{int(b)})'
        if potrace_transform:
            lines.append(
                f'<g transform="{potrace_transform}" fill="{fill}" '
                f'stroke="none" fill-rule="evenodd">'
                f'<path d="{d}"/></g>'
            )
        else:
            lines.append(
                f'<path fill="{fill}" stroke="none" fill-rule="evenodd" d="{d}"/>'
            )

    lines.append("</g>")
    lines.append("</svg>")

    output_path.write_text("\n".join(lines), encoding="utf-8")
