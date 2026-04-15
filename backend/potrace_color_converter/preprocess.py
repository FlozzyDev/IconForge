"""Stateless preprocessing helpers for the Potrace color pipeline."""
from typing import Tuple

import cv2
import numpy as np


def upscale_rgba(
    rgb: np.ndarray, alpha: np.ndarray, factor: int
) -> Tuple[np.ndarray, np.ndarray]:
    """Upscale RGB with Lanczos (smooth) and alpha with nearest (crisp edges)."""
    if factor <= 1:
        return rgb, alpha
    h, w = rgb.shape[:2]
    new_size = (w * factor, h * factor)
    rgb_up = cv2.resize(rgb, new_size, interpolation=cv2.INTER_LANCZOS4)
    alpha_up = cv2.resize(alpha, new_size, interpolation=cv2.INTER_NEAREST)
    return rgb_up, alpha_up


def edge_preserving_smooth(
    rgb: np.ndarray, mode: str, spatial_radius: int, color_radius: int
) -> np.ndarray:
    """Apply an edge-preserving smoothing filter.

    Args:
        rgb: HxWx3 uint8 array.
        mode: "none", "bilateral", or "mean_shift".
        spatial_radius: Spatial window radius.
        color_radius: Color window radius.
    """
    if mode == "none":
        return rgb
    if mode == "bilateral":
        # d=9 is a reasonable fixed diameter; sigmaColor/sigmaSpace drive the strength.
        return cv2.bilateralFilter(
            rgb, d=9, sigmaColor=float(color_radius), sigmaSpace=float(spatial_radius)
        )
    if mode == "mean_shift":
        # pyrMeanShiftFiltering expects a 3-channel 8-bit image; it clusters edge-
        # preserving neighborhoods which snaps AA transitions to the dominant side.
        return cv2.pyrMeanShiftFiltering(
            rgb, sp=float(spatial_radius), sr=float(color_radius)
        )
    raise ValueError(f"Unknown smoothing mode: {mode}")


def quantize_lab(
    rgb: np.ndarray, opaque_mask: np.ndarray, n_colors: int
) -> Tuple[np.ndarray, np.ndarray]:
    """Cluster opaque pixels into n_colors groups via k-means in Lab color space.

    Args:
        rgb: HxWx3 uint8 RGB array.
        opaque_mask: HxW bool array, True where alpha >= threshold.
        n_colors: Number of clusters.

    Returns:
        labels: HxW int32 array. Label = cluster index for opaque pixels; -1 for transparent.
        centers_rgb: (n_colors, 3) uint8 RGB centroid colors.
    """
    h, w = rgb.shape[:2]
    # Convert full image to Lab for perceptual clustering, then sample only opaque pixels.
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    opaque_flat = opaque_mask.reshape(-1)
    lab_flat = lab.reshape(-1, 3).astype(np.float32)
    subject_pixels = lab_flat[opaque_flat]

    if subject_pixels.shape[0] == 0:
        # Nothing to cluster — return all-transparent labels.
        return np.full((h, w), -1, dtype=np.int32), np.zeros((n_colors, 3), dtype=np.uint8)

    # Clamp n_colors to the number of unique pixels (k-means fails if k > samples).
    k = min(n_colors, subject_pixels.shape[0])
    criteria = (
        cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
        20,
        1.0,
    )
    _, sub_labels, centers_lab = cv2.kmeans(
        subject_pixels, k, None, criteria, 3, cv2.KMEANS_PP_CENTERS
    )
    sub_labels = sub_labels.reshape(-1)

    # Re-embed labels into full image (transparent pixels = -1).
    labels_flat = np.full(h * w, -1, dtype=np.int32)
    labels_flat[opaque_flat] = sub_labels
    labels = labels_flat.reshape(h, w)

    # Convert centroid Lab colors back to RGB for fills.
    centers_lab_img = centers_lab.reshape(1, -1, 3).astype(np.uint8)
    centers_rgb = cv2.cvtColor(centers_lab_img, cv2.COLOR_LAB2RGB).reshape(-1, 3)

    return labels, centers_rgb
