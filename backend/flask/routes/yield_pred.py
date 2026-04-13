"""
Route: POST /predict-yield
"""

from flask import Blueprint, request, jsonify

from models.loader         import BASE_YIELDS
from services.soil_quality import soil_quality_score, soil_multiplier, score_rating

yield_bp = Blueprint("yield", __name__)

SEASON_FACTORS = {
    "kharif": 1.05,
    "rabi":   1.00,
    "zaid":   0.90,
    "summer": 0.90,
    "winter": 1.00,
    "annual": 1.00,
}


@yield_bp.route("/predict-yield", methods=["POST"])
def predict_yield():
    """
    Body : { N, P, K, temperature, humidity, ph, rainfall,
             crop, season, area_acres }
    Returns : { predicted_yield_tonnes, yield_per_acre,
                soil_quality_score, soil_rating, unit }
    """
    data = request.get_json(force=True)
    try:
        crop       = data.get("crop", "").lower().strip()
        season     = data.get("season", "kharif").lower().strip()
        area_acres = float(data.get("area_acres", 1.0))

        sq_score       = soil_quality_score(data)
        base_yield     = BASE_YIELDS.get(crop, BASE_YIELDS.get("default", 2.5))
        season_factor  = SEASON_FACTORS.get(season, 1.0)

        yield_per_acre = round(base_yield * soil_multiplier(sq_score) * season_factor, 3)
        total_yield    = round(yield_per_acre * area_acres, 3)

        return jsonify({
            "predicted_yield_tonnes": total_yield,
            "yield_per_acre":         yield_per_acre,
            "soil_quality_score":     sq_score,
            "soil_rating":            score_rating(sq_score),
            "unit":                   "tonnes",
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400
