# ⚠️  DEPRECATED — this file has been moved to backend/flask/
#
# All ML service logic now lives in:
#
#   backend/flask/
#     app.py                  ← entry point  (python app.py)
#     models/
#       pipeline.py           ← CropPipeline class + engineer_features
#       loader.py             ← loads model.pkl / encoder.pkl / soil_metadata.pkl
#     services/
#       soil_quality.py       ← Method 1 + Method 3 scoring
#       fertilizer.py         ← fertilizer recommendation engine
#     routes/
#       crop.py               ← POST /predict-crop, POST /soil-quality
#       yield_pred.py         ← POST /predict-yield
#       fertilizer.py         ← POST /recommend-fertilizer
#
# To start the Flask service:
#     cd backend/flask
#     python app.py

raise SystemExit(
    "\n\n  This file is deprecated.\n"
    "  Run the Flask service from:  backend/flask/app.py\n\n"
    "  cd backend/flask && python app.py\n"
)
