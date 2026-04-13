"""
Soil quality scoring service — Method 1 + Method 3.

Method 1 (60%): top-1 crop model prediction confidence.
  High confidence → soil perfectly matches a known crop profile → high quality.

Method 3 (40%): weighted average of min-max normalised raw features.
  Each feature is normalised against training-set min/max then weighted by its
  Pearson correlation with the target (stored in soil_metadata.pkl).

After normalisation all attributes behave as benefit attributes (higher = better),
so a simple weighted sum is valid.
"""

import numpy as np
from models.loader import (
    crop_pipeline, FEAT_MIN, FEAT_MAX, FEAT_WEIGHTS, RAW_COLS, make_sample,
)


# ── Method 1 ─────────────────────────────────────────────────────────────────
def confidence_score(data: dict) -> float:
    """Return top-1 prediction confidence as a 0-100 score."""
    sample = make_sample(data)
    probs  = crop_pipeline.predict_proba(sample)[0]
    return float(np.max(probs)) * 100


# ── Method 3 ─────────────────────────────────────────────────────────────────
def feature_importance_score(data: dict) -> float:
    """Return feature-importance-weighted normalised score (0-100)."""
    total_w = 0.0
    w_sum   = 0.0
    for col in RAW_COLS:
        val     = float(data[col])
        col_min = FEAT_MIN.get(col, 0)
        col_max = FEAT_MAX.get(col, 1)
        norm    = (val - col_min) / (col_max - col_min + 1e-9)
        norm    = max(0.0, min(1.0, norm))
        weight  = FEAT_WEIGHTS.get(col, 1.0)
        w_sum  += norm * weight
        total_w += weight
    return (w_sum / total_w * 100) if total_w > 0 else 50.0


# ── Combined ──────────────────────────────────────────────────────────────────
def soil_quality_score(data: dict) -> float:
    """60% confidence score + 40% feature importance score → 0-100."""
    return round(0.60 * confidence_score(data) + 0.40 * feature_importance_score(data), 2)


def score_rating(score: float) -> str:
    if score >= 80:  return "Excellent"
    if score >= 65:  return "Good"
    if score >= 50:  return "Average"
    if score >= 35:  return "Below Average"
    return "Poor"


def soil_multiplier(score: float) -> float:
    """Map 0-100 soil quality score to a yield multiplier (0.40 – 1.20×)."""
    return 0.40 + (score / 100) * 0.80
