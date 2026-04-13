"""
CropPipeline class and engineer_features function.

IMPORTANT: This module must be imported BEFORE any pickle.load() that loads
model.pkl — because model.pkl stores the CropPipeline class by name and Python
needs to find it in the namespace during deserialization.
"""

import pandas as pd


def engineer_features(df_in: pd.DataFrame) -> pd.DataFrame:
    """
    Reproduce the feature engineering from train_final.ipynb.
    Input: DataFrame with columns [N, P, K, temperature, humidity, ph, rainfall]
    Output: DataFrame with all original + engineered columns.
    """
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
        labels=[0, 1, 2, 3],
    ).astype(float)
    return df


class CropPipeline:
    """
    End-to-end crop prediction pipeline saved by train_final.ipynb:
        Feature Engineering → RobustScaler → Calibrated HistGradientBoosting
    """

    def __init__(self, model, scaler, label_encoder, feature_cols):
        self.model        = model
        self.scaler       = scaler
        self.le           = label_encoder
        self.feature_cols = feature_cols

    def _prepare(self, df_raw: pd.DataFrame):
        df_e = engineer_features(df_raw)
        return self.scaler.transform(df_e[self.feature_cols])

    def predict(self, df_raw: pd.DataFrame):
        X = self._prepare(df_raw)
        return self.le.inverse_transform(self.model.predict(X))

    def predict_proba(self, df_raw: pd.DataFrame):
        X = self._prepare(df_raw)
        return self.model.predict_proba(X)
