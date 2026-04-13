"""
Route: POST /recommend-fertilizer
"""

from flask import Blueprint, request, jsonify
from services.fertilizer import get_recommendations

fertilizer_bp = Blueprint("fertilizer", __name__)


@fertilizer_bp.route("/recommend-fertilizer", methods=["POST"])
def recommend_fertilizer():
    """
    Body : { N, P, K, ph, crop, soilType }
    Returns : {
        recommendations     : [{ name, npk_ratio, reason, priority, quantity_kg_per_acre }],
        recommendedFertilizer : str   (primary fertilizer name),
        nitrogenStatus      : str,
        phosphorusStatus    : str,
        potassiumStatus     : str,
        advice              : str,
    }
    """
    data = request.get_json(force=True)
    try:
        n         = float(data["N"])
        p         = float(data["P"])
        k         = float(data["K"])
        ph        = float(data.get("ph", 6.5))
        crop      = data.get("crop", "").strip()
        soil_type = data.get("soilType", "").strip()

        recs, advice, n_status, p_status, k_status = get_recommendations(
            n, p, k, ph, crop, soil_type
        )

        # Primary = first non-informational recommendation
        primary = next(
            (r["name"] for r in recs if r.get("priority") != "Info"),
            recs[0]["name"] if recs else "Balanced NPK",
        )

        return jsonify({
            "recommendations":       recs,
            "recommendedFertilizer": primary,
            "nitrogenStatus":        n_status,
            "phosphorusStatus":      p_status,
            "potassiumStatus":       k_status,
            "advice":                advice,
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400
