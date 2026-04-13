"""
Fertilizer recommendation engine.

For each of N, P, K:
  - Looks up crop-specific optimal range from CROP_NPK_OPTIMA.
  - Computes status: Critical / Low / Normal / High.
  - Recommends the appropriate fertilizer (Urea, DAP, MOP) with quantity.
Also generates pH and soil-type agronomic advice.
"""


# ── Crop-specific NPK optima (mg/kg): (min_acceptable, optimal) ──────────────
CROP_NPK_OPTIMA = {
    # Cereals
    "rice":         {"N": (60, 80),  "P": (30, 50),  "K": (30, 50)},
    "wheat":        {"N": (60, 80),  "P": (30, 50),  "K": (30, 50)},
    "maize":        {"N": (70, 90),  "P": (35, 55),  "K": (35, 50)},
    "barley":       {"N": (50, 70),  "P": (25, 45),  "K": (25, 40)},
    "ragi":         {"N": (50, 70),  "P": (25, 40),  "K": (25, 40)},
    "sorghum":      {"N": (55, 75),  "P": (25, 40),  "K": (25, 40)},
    # Pulses / legumes
    "chickpea":     {"N": (20, 40),  "P": (40, 60),  "K": (20, 35)},
    "lentil":       {"N": (20, 40),  "P": (35, 55),  "K": (20, 35)},
    "mungbean":     {"N": (20, 40),  "P": (40, 60),  "K": (20, 35)},
    "blackgram":    {"N": (20, 40),  "P": (40, 60),  "K": (20, 35)},
    "kidneybeans":  {"N": (20, 40),  "P": (40, 60),  "K": (20, 35)},
    "pigeonpeas":   {"N": (20, 40),  "P": (40, 60),  "K": (20, 35)},
    "horsegram":    {"N": (20, 40),  "P": (35, 55),  "K": (20, 35)},
    "mothbeans":    {"N": (20, 40),  "P": (35, 55),  "K": (20, 35)},
    "soybean":      {"N": (20, 40),  "P": (40, 60),  "K": (20, 35)},
    # Cash crops
    "cotton":       {"N": (80, 110), "P": (40, 60),  "K": (40, 60)},
    "jute":         {"N": (60, 90),  "P": (30, 50),  "K": (30, 50)},
    "coffee":       {"N": (70, 90),  "P": (30, 50),  "K": (60, 80)},
    "cardamom":     {"N": (60, 80),  "P": (30, 50),  "K": (50, 70)},
    "blackpepper":  {"N": (70, 90),  "P": (30, 50),  "K": (60, 80)},
    "coconut":      {"N": (70, 90),  "P": (30, 50),  "K": (70, 90)},
    "rapeseed":     {"N": (80, 110), "P": (40, 60),  "K": (30, 50)},
    "sunflower":    {"N": (60, 80),  "P": (30, 50),  "K": (30, 50)},
    # Fruits
    "apple":        {"N": (40, 60),  "P": (20, 40),  "K": (50, 80)},
    "banana":       {"N": (80, 110), "P": (30, 50),  "K": (80, 110)},
    "mango":        {"N": (50, 70),  "P": (20, 40),  "K": (50, 70)},
    "grapes":       {"N": (40, 60),  "P": (20, 40),  "K": (40, 60)},
    "orange":       {"N": (50, 70),  "P": (20, 40),  "K": (50, 70)},
    "papaya":       {"N": (60, 90),  "P": (30, 50),  "K": (60, 80)},
    "pomegranate":  {"N": (50, 70),  "P": (25, 45),  "K": (50, 70)},
    "watermelon":   {"N": (60, 80),  "P": (30, 50),  "K": (40, 60)},
    "muskmelon":    {"N": (60, 80),  "P": (30, 50),  "K": (40, 60)},
    "pineapple":    {"N": (60, 90),  "P": (20, 40),  "K": (60, 90)},
    "jackfruit":    {"N": (50, 70),  "P": (20, 40),  "K": (40, 60)},
    # Vegetables
    "tomato":       {"N": (80, 110), "P": (40, 60),  "K": (50, 70)},
    "potato":       {"N": (80, 110), "P": (40, 60),  "K": (60, 90)},
    "onion":        {"N": (70, 90),  "P": (35, 55),  "K": (40, 60)},
    "garlic":       {"N": (60, 80),  "P": (35, 55),  "K": (40, 60)},
    "cabbage":      {"N": (80, 110), "P": (40, 60),  "K": (40, 60)},
    "cauliflower":  {"N": (80, 110), "P": (40, 60),  "K": (40, 60)},
    "brinjal":      {"N": (70, 90),  "P": (35, 55),  "K": (35, 55)},
    "okra":         {"N": (60, 80),  "P": (30, 50),  "K": (30, 50)},
    "radish":       {"N": (60, 80),  "P": (30, 50),  "K": (30, 50)},
    "cucumber":     {"N": (60, 80),  "P": (30, 50),  "K": (40, 60)},
    "bitter_gourd": {"N": (60, 80),  "P": (30, 50),  "K": (40, 60)},
    "bottle_gourd": {"N": (60, 80),  "P": (30, 50),  "K": (40, 60)},
    "pumpkin":      {"N": (60, 80),  "P": (30, 50),  "K": (40, 60)},
    # Spices / misc
    "coriander":    {"N": (50, 70),  "P": (25, 45),  "K": (25, 40)},
    "turmeric":     {"N": (60, 80),  "P": (30, 50),  "K": (60, 80)},
    "drumstick":    {"N": (50, 70),  "P": (25, 45),  "K": (30, 50)},
    "sweet_potato": {"N": (60, 80),  "P": (30, 50),  "K": (60, 90)},
}

DEFAULT_OPTIMA = {"N": (60, 80), "P": (30, 50), "K": (30, 50)}


# ── Helpers ───────────────────────────────────────────────────────────────────
def _nutrient_status(val: float, optima: tuple) -> str:
    min_ok, optimal = optima
    if val >= optimal:       return "High"
    if val >= min_ok:        return "Normal"
    if val >= min_ok * 0.5:  return "Low"
    return "Critical"


def _ph_advice(ph: float) -> str:
    if ph < 5.5:
        return (
            f"Soil is acidic (pH {ph:.1f}). Apply agricultural lime (2-3 t/ha) to raise pH. "
            "Avoid ammonium-based fertilizers which further acidify soil."
        )
    if ph > 7.5:
        return (
            f"Soil is alkaline (pH {ph:.1f}). Apply gypsum or elemental sulphur to lower pH. "
            "Prefer acidifying fertilizers like ammonium sulphate."
        )
    return f"Soil pH {ph:.1f} is in the optimal range (5.5–7.5). No pH amendment needed."


def _soil_type_tip(soil_type: str) -> str:
    st = soil_type.lower()
    if "sandy" in st:
        return "Sandy soil: apply fertilizer in smaller, more frequent doses and incorporate FYM (5-8 t/ha) to improve water retention."
    if "clay" in st:
        return "Clay soil: avoid heavy applications before rain; add organic matter to improve aeration and drainage."
    if "loam" in st:
        return "Loamy soil: standard fertilizer schedules apply well. Good nutrient and water retention."
    return ""


# ── Main public function ──────────────────────────────────────────────────────
def get_recommendations(n: float, p: float, k: float,
                         ph: float, crop: str, soil_type: str):
    """
    Returns:
        recs         list[dict]  — fertilizer recommendations
        advice       str         — multi-line agronomic advice
        n_status     str
        p_status     str
        k_status     str
    """
    optima   = CROP_NPK_OPTIMA.get(crop.lower().strip(), DEFAULT_OPTIMA)
    n_status = _nutrient_status(n, optima["N"])
    p_status = _nutrient_status(p, optima["P"])
    k_status = _nutrient_status(k, optima["K"])

    recs = []

    # Nitrogen
    if n_status in ("Critical", "Low"):
        _, n_opt = optima["N"]
        qty = round(max(n_opt - n, 0) / 0.46 * 0.45, 1)
        recs.append({
            "name":                 "Urea (46-0-0)",
            "npk_ratio":            "46-0-0",
            "reason":               f"Nitrogen is {n_status.lower()} ({n:.0f} mg/kg; target {n_opt} mg/kg). Apply in 2 split doses — 50% at sowing, 50% at tillering.",
            "priority":             "Urgent" if n_status == "Critical" else "High",
            "quantity_kg_per_acre": qty,
        })
    elif n_status == "High":
        recs.append({
            "name":                 "Skip Nitrogen",
            "npk_ratio":            "",
            "reason":               f"Nitrogen already high ({n:.0f} mg/kg). No N fertilizer needed — excess promotes vegetative growth at the cost of yield.",
            "priority":             "Info",
            "quantity_kg_per_acre": 0,
        })

    # Phosphorus
    if p_status in ("Critical", "Low"):
        _, p_opt = optima["P"]
        qty = round(max(p_opt - p, 0) / 0.46 * 0.50, 1)
        recs.append({
            "name":                 "DAP (18-46-0)",
            "npk_ratio":            "18-46-0",
            "reason":               f"Phosphorus is {p_status.lower()} ({p:.0f} mg/kg; target {p_opt} mg/kg). Apply at sowing — phosphorus needs to be near seed/roots.",
            "priority":             "Urgent" if p_status == "Critical" else "High",
            "quantity_kg_per_acre": qty,
        })

    # Potassium
    if k_status in ("Critical", "Low"):
        _, k_opt = optima["K"]
        qty = round(max(k_opt - k, 0) / 0.60 * 0.50, 1)
        recs.append({
            "name":                 "MOP / Muriate of Potash (0-0-60)",
            "npk_ratio":            "0-0-60",
            "reason":               f"Potassium is {k_status.lower()} ({k:.0f} mg/kg; target {k_opt} mg/kg). Apply in two split doses for better uptake.",
            "priority":             "Urgent" if k_status == "Critical" else "High",
            "quantity_kg_per_acre": qty,
        })

    # Maintenance fallback
    if not recs or all(r["name"].startswith("Skip") for r in recs):
        recs = [{
            "name":                 "NPK 10-26-26",
            "npk_ratio":            "10-26-26",
            "reason":               "All nutrients are at optimal levels. Apply a balanced fertilizer as a maintenance dose.",
            "priority":             "Low",
            "quantity_kg_per_acre": 25.0,
        }]

    # Build advice
    parts = [
        f"Nutrient Status — N: {n_status}  |  P: {p_status}  |  K: {k_status}",
        _ph_advice(ph),
    ]
    tip = _soil_type_tip(soil_type)
    if tip:
        parts.append(tip)

    return recs, "\n".join(parts), n_status, p_status, k_status
