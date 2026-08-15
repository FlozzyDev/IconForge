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


def merge_similar_colors(
    labels: np.ndarray, centers_rgb: np.ndarray, max_distance: float
) -> Tuple[np.ndarray, np.ndarray]:
    """Merge k-means clusters whose centers are within max_distance in Lab space.

    K-means with a generous k often lands extra clusters on anti-aliasing
    gradients, producing near-duplicate color layers. This collapses any group
    of clusters closer than max_distance (OpenCV Lab units, roughly delta-E)
    into one, with the merged center being the pixel-count-weighted average.

    Args:
        labels: HxW int32 array from quantize_lab (-1 = transparent).
        centers_rgb: (N, 3) uint8 RGB centroids.
        max_distance: Merge threshold; 0 disables merging.

    Returns:
        (labels, centers_rgb) with merged clusters relabeled contiguously.
    """
    n = centers_rgb.shape[0]
    if max_distance <= 0 or n <= 1:
        return labels, centers_rgb

    centers_lab = (
        cv2.cvtColor(centers_rgb.reshape(1, -1, 3), cv2.COLOR_RGB2LAB)
        .reshape(-1, 3)
        .astype(np.float64)
    )

    # Union-find over cluster pairs within threshold.
    parent = list(range(n))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for i in range(n):
        for j in range(i + 1, n):
            if np.linalg.norm(centers_lab[i] - centers_lab[j]) <= max_distance:
                parent[find(i)] = find(j)

    roots = [find(i) for i in range(n)]
    unique_roots = sorted(set(roots))
    if len(unique_roots) == n:
        return labels, centers_rgb

    # Weighted-average merged centers in Lab, weighted by cluster pixel count.
    counts = np.array([(labels == i).sum() for i in range(n)], dtype=np.float64)
    root_to_new = {root: new for new, root in enumerate(unique_roots)}
    new_centers_lab = np.zeros((len(unique_roots), 3), dtype=np.float64)
    new_counts = np.zeros(len(unique_roots), dtype=np.float64)
    for i in range(n):
        new_idx = root_to_new[roots[i]]
        new_centers_lab[new_idx] += centers_lab[i] * counts[i]
        new_counts[new_idx] += counts[i]
    new_counts[new_counts == 0] = 1  # empty clusters: avoid div-by-zero
    new_centers_lab /= new_counts[:, None]

    new_centers_rgb = cv2.cvtColor(
        np.clip(new_centers_lab, 0, 255).astype(np.uint8).reshape(1, -1, 3),
        cv2.COLOR_LAB2RGB,
    ).reshape(-1, 3)

    # Remap labels (transparent -1 passes through).
    mapping = np.array([root_to_new[roots[i]] for i in range(n)], dtype=np.int32)
    new_labels = np.where(labels >= 0, mapping[np.clip(labels, 0, n - 1)], -1)

    return new_labels.astype(np.int32), new_centers_rgb


def clean_mask(mask: np.ndarray, upscale: int) -> np.ndarray:
    """Morphological open + close to drop pixel islands and smooth ragged edges.

    The kernel scales with the upscale factor so cleanup strength stays constant
    in source-pixel terms.
    """
    kernel_size = max(3, 2 * upscale + 1)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    m = mask.astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, kernel)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, kernel)
    return m.astype(bool)


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
