"""
Model loader — loads model.pkl, encoder.pkl, soil_metadata.pkl.

IMPORTANT: model.pkl was pickled inside a Jupyter notebook where CropPipeline
and engineer_features lived in __main__.  When pickle deserializes the file it
looks for those names in __main__ of the *current* process.  We fix this by
injecting the classes into sys.modules["__main__"] before calling pickle.load.
"""

import os
import sys
import pickle
import pathlib

# ── Step 1: define CropPipeline in this module ───────────────────────────────
from models.pipeline import CropPipeline, engineer_features  # noqa: F401

# ── Step 2: inject into __main__ so pickle.load can find them ────────────────
import __main__
__main__.CropPipeline      = CropPipeline
__main__.engineer_features = engineer_features

# ── Step 3: resolve paths (backend/flask/models/loader.py → backend/) ────────
_BACKEND_DIR = pathlib.Path(__file__).resolve().parents[2]

PIPELINE_PATH = os.getenv("MODEL_PATH",    str(_BACKEND_DIR / "model.pkl"))
ENCODER_PATH  = os.getenv("ENCODER_PATH",  str(_BACKEND_DIR / "encoder.pkl"))
METADATA_PATH = os.getenv("METADATA_PATH", str(_BACKEND_DIR / "soil_metadata.pkl"))

# ── Step 4: load ──────────────────────────────────────────────────────────────
crop_pipeline = pickle.load(open(PIPELINE_PATH, "rb"))
le            = pickle.load(open(ENCODER_PATH,   "rb"))
meta          = pickle.load(open(METADATA_PATH,  "rb"))

FEAT_MIN     = meta["feat_min"]
FEAT_MAX     = meta["feat_max"]
FEAT_WEIGHTS = meta["feat_weights"]
BASE_YIELDS  = meta["base_yields"]

RAW_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


def make_sample(data: dict):
    """Build a single-row DataFrame from a request dict."""
    import pandas as pd
    return pd.DataFrame(
        [[data["N"], data["P"], data["K"],
          data["temperature"], data["humidity"],
          data["ph"], data["rainfall"]]],
        columns=RAW_COLS,
    )

