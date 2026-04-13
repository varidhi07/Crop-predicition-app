"""
Route: GET /model-info
Returns feature importance weights and model summary stats for the Insights page.
"""

from flask import Blueprint, jsonify
from models.loader import FEAT_WEIGHTS, BASE_YIELDS, le

info_bp = Blueprint("info", __name__)

# Fixed stats from train_final.ipynb training run
MODEL_STATS = {
    "trainingsamples": 2200,
    "testAccuracy":    99.09,
    "f1Score":         0.991,
    "cropsSupported":  22,
    "featuresUsed":    7,
    "crossValScore":   0.990,
}


@info_bp.route("/model-info", methods=["GET"])
def model_info():
    """
    Returns:
      featureWeights : [{ feature, importance }]  sorted desc
      modelStats     : { trainingsamples, testAccuracy, ... }
      supportedCrops : [str]
    """
    weights = [
        {"feature": col.replace("_", " ").title(), "importance": round(w, 4)}
        for col, w in sorted(FEAT_WEIGHTS.items(), key=lambda x: -x[1])
    ]

    return jsonify({
        "featureWeights": weights,
        "modelStats":     MODEL_STATS,
        "supportedCrops": sorted(le.classes_.tolist()),
    })
