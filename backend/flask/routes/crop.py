"""
Routes: POST /predict-crop
        POST /soil-quality
"""

import numpy as np
from flask import Blueprint, request, jsonify

from models.loader        import crop_pipeline, le, make_sample
from services.soil_quality import (
    soil_quality_score, confidence_score,
    feature_importance_score, score_rating,
)

crop_bp = Blueprint("crop", __name__)


@crop_bp.route("/predict-crop", methods=["POST"])
def predict_crop():
    """
    Body : { N, P, K, temperature, humidity, ph, rainfall }
    Returns : { best_crop, confidence, top_crops, reliable, soil_quality_score }
    """
    data = request.get_json(force=True)
    try:
        sample    = make_sample(data)
        probs     = crop_pipeline.predict_proba(sample)[0]
        top_idx   = np.argsort(probs)[::-1][:3]
        top_crops = [
            {"crop": le.classes_[i], "confidence": round(float(probs[i]) * 100, 2)}
            for i in top_idx
        ]
        best_crop  = top_crops[0]["crop"]
        confidence = top_crops[0]["confidence"]
        sq_score   = soil_quality_score(data)

        return jsonify({
            "best_crop":          best_crop,
            "confidence":         confidence,
            "top_crops":          top_crops,
            "reliable":           confidence >= 70,
            "soil_quality_score": sq_score,
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@crop_bp.route("/soil-quality", methods=["POST"])
def soil_quality():
    """
    Body : { N, P, K, temperature, humidity, ph, rainfall }
    Returns : { soil_quality_score, method1_score, method3_score, rating }
    """
    data = request.get_json(force=True)
    try:
        m1    = confidence_score(data)
        m3    = feature_importance_score(data)
        score = round(0.60 * m1 + 0.40 * m3, 2)
        return jsonify({
            "soil_quality_score": score,
            "method1_score":      round(m1, 2),
            "method3_score":      round(m3, 2),
            "rating":             score_rating(score),
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400
