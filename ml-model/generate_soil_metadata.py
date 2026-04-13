"""
Run this script ONCE from the ml-model/ directory.
It trains the model metadata needed for soil quality scoring and saves soil_metadata.pkl.

Usage:
    cd ml-model
    python generate_soil_metadata.py
"""

import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, RobustScaler
from sklearn.ensemble import HistGradientBoostingClassifier

# ------------------------------------------------------------------ #
# 1. Load data                                                         #
# ------------------------------------------------------------------ #
df = pd.read_csv("Crop_recommendation.csv")
print(f"Loaded dataset: {df.shape}")

# ------------------------------------------------------------------ #
# 2. Feature engineering (mirrors train_final.ipynb)                  #
# ------------------------------------------------------------------ #
def engineer_features(df_in):
    df = df_in.copy()
    df["N_P_ratio"]   = df["N"] / (df["P"] + 1e-5)
    df["N_K_ratio"]   = df["N"] / (df["K"] + 1e-5)
    df["P_K_ratio"]   = df["P"] / (df["K"] + 1e-5)
    df["NPK_sum"]     = df["N"] + df["P"] + df["K"]
    df["NPK_product"] = df["N"] * df["P"] * df["K"]
    df["heat_index"]  = df["temperature"] * df["humidity"] / 100
    df["aridity"]     = df["rainfall"] / (df["temperature"] + 1)
    df["temp_rain"]   = df["temperature"] * df["rainfall"]
    df["humid_rain"]  = df["humidity"]    * df["rainfall"]
    df["ph_N"]        = df["ph"] * df["N"]
    df["ph_class"]    = pd.cut(
        df["ph"],
        bins=[0, 5.5, 6.5, 7.5, 14],
        labels=[0, 1, 2, 3]
    ).astype(float)
    return df

df_eng = engineer_features(df.drop("label", axis=1))
df_eng["label"] = df["label"].values

feature_cols = [c for c in df_eng.columns if c != "label"]
X = df_eng[feature_cols]
y = df_eng["label"]

le = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)

scaler = RobustScaler()
X_train_sc = scaler.fit_transform(X_train)

RAW_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# ------------------------------------------------------------------ #
# 3. Feature min/max from TRAINING data (for normalisation)           #
# ------------------------------------------------------------------ #
feat_min = {col: float(df[col].min()) for col in RAW_COLS}
feat_max = {col: float(df[col].max()) for col in RAW_COLS}
print("\nFeature ranges:")
for col in RAW_COLS:
    print(f"  {col:15s} min={feat_min[col]:.2f}  max={feat_max[col]:.2f}")

# ------------------------------------------------------------------ #
# 4. Feature importance weights (Method 3)                            #
#    Use |Pearson correlation| with numeric label as a lightweight    #
#    proxy for importance.  Only over original 7 features.           #
# ------------------------------------------------------------------ #
weights_raw = {}
for col in RAW_COLS:
    col_idx = list(feature_cols).index(col)
    corr = abs(np.corrcoef(X_train_sc[:, col_idx], y_train)[0, 1])
    weights_raw[col] = float(corr)

# Normalise weights so they sum to 1
total_w = sum(weights_raw.values())
feat_weights = {k: v / total_w for k, v in weights_raw.items()}
print("\nFeature importance weights (Method 3):")
for col, w in sorted(feat_weights.items(), key=lambda x: -x[1]):
    print(f"  {col:15s} weight={w:.4f}")

# ------------------------------------------------------------------ #
# 5. Base yields per crop (tonnes / acre) — agronomic lookup table    #
# ------------------------------------------------------------------ #
# Source: approximate global averages; adjust for your region as needed
base_yields = {
    "apple":        2.50,
    "banana":       8.00,
    "barley":       1.80,
    "bitter_gourd": 5.00,
    "blackgram":    0.70,
    "blackpepper":  0.35,
    "bottle_gourd": 8.00,
    "brinjal":      6.50,
    "cabbage":      9.00,
    "cardamom":     0.20,
    "cauliflower":  7.50,
    "chickpea":     0.75,
    "coconut":      4.00,   # 4 tonnes copra-equivalent
    "coffee":       0.50,
    "coriander":    0.40,
    "cotton":       0.60,
    "cucumber":     7.00,
    "drumstick":    2.00,
    "garlic":       3.50,
    "grapes":       5.00,
    "horsegram":    0.50,
    "jackfruit":    5.00,
    "jute":         1.50,
    "kidneybeans":  0.80,
    "lentil":       0.65,
    "maize":        2.50,
    "mango":        3.50,
    "mothbeans":    0.50,
    "mungbean":     0.60,
    "muskmelon":    5.00,
    "okra":         4.00,
    "onion":        6.00,
    "orange":       4.00,
    "papaya":       8.00,
    "pigeonpeas":   0.65,
    "pineapple":    6.00,
    "pomegranate":  3.50,
    "potato":       7.00,
    "pumpkin":      7.00,
    "radish":       5.00,
    "ragi":         1.50,
    "rapeseed":     0.90,
    "rice":         2.00,
    "sorghum":      1.50,
    "soybean":      0.80,
    "sunflower":    0.70,
    "sweet_potato": 5.00,
    "tomato":       8.00,
    "turmeric":     2.00,
    "watermelon":   8.00,
    "wheat":        2.20,
    # fallback
    "default":      2.00,
}
print(f"\nBase yields table: {len(base_yields)} entries")

# ------------------------------------------------------------------ #
# 6. Save metadata                                                     #
# ------------------------------------------------------------------ #
metadata = {
    "feat_min":     feat_min,
    "feat_max":     feat_max,
    "feat_weights": feat_weights,
    "base_yields":  base_yields,
}
pickle.dump(metadata, open("../backend/soil_metadata.pkl", "wb"))
print("\n✅ Saved  ../backend/soil_metadata.pkl")
print("   Keys:", list(metadata.keys()))
