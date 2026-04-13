"""
FarmAssist - Flask Backend
Entry point. Registers all route blueprints.

Run:
    cd backend/flask
    python app.py
"""

import os
from flask import Flask
from flask_cors import CORS

from routes.crop        import crop_bp
from routes.yield_pred  import yield_bp
from routes.fertilizer  import fertilizer_bp
from routes.info        import info_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(crop_bp)
    app.register_blueprint(yield_bp)
    app.register_blueprint(fertilizer_bp)
    app.register_blueprint(info_bp)

    @app.route("/health", methods=["GET"])
    def health():
        from flask import jsonify
        return jsonify({"status": "ok", "service": "FarmAssist ML"})

    return app


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5001))
    app  = create_app()
    app.run(host="0.0.0.0", port=port, debug=False)
