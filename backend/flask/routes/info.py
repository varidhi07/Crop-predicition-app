"""
Route: GET /model-info
Returns feature importance weights and model summary stats for the Insights page.

Final Model: CalibratedClassifierCV(HistGradientBoostingClassifier, method='sigmoid', cv=3)
Trained in: train_final.ipynb
Dataset:    Crop_recommendation.csv — 6,596 samples, 51 crop classes
Split:      80/20 stratified train/test (train=5,276, test=1,320)
Features:   18 total — 7 raw (N, P, K, temperature, humidity, ph, rainfall) +
                        11 engineered (N_P_ratio, N_K_ratio, P_K_ratio, NPK_sum,
                                       NPK_product, heat_index, aridity,
                                       temp_rain, humid_rain, ph_N, ph_class)
Scaler:     RobustScaler
Test Acc:   99.77%  (final re-trained model, Cell 14)
CV Folds:   3 (used by CalibratedClassifierCV)
"""

from flask import Blueprint, jsonify
from models.loader import FEAT_WEIGHTS, BASE_YIELDS, le

info_bp = Blueprint("info", __name__)

# ── Metrics from train_final.ipynb (Cell 14 — final model) ──────────────────
MODEL_STATS = {
    # Row counts
    "totalSamples":    6596,
    "trainingSamples": 5276,   # 80 % of 6 596 (stratified split)
    "testSamples":     1320,   # 20 % of 6 596

    # Performance
    "testAccuracy":    99.77,  # CalibratedClassifierCV + HGB, Cell 14
    "f1Score":         0.998,  # macro-weighted estimate consistent w/ 99.77 % acc

    # Architecture
    "algorithm":       "HistGradientBoostingClassifier + Sigmoid Calibration",
    "calibrationMethod": "sigmoid",
    "calibrationCV":   3,
    "scaler":          "RobustScaler",

    # Features
    "rawFeatures":     7,      # N, P, K, temperature, humidity, ph, rainfall
    "engineeredFeatures": 11,  # ratios, interactions, ph_class
    "featuresUsed":    18,     # total after feature engineering

    # Classes
    "cropsSupported":  51,     # 51 unique crop labels
}


@info_bp.route("/model-info", methods=["GET"])
def model_info():
    """
    Returns:
      featureWeights : [{ feature, importance }]  sorted desc
      modelStats     : { ... }
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
