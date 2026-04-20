"""
routes/chat.py
──────────────
Endpoints:
    POST   /api/chat                – send a message, get an AI reply
    DELETE /api/chat/<session_id>   – clear that session's history

Request body (POST):
    {
        "session_id": "<uuid-string>",
        "message":    "<user text>"
    }

Response (POST):
    { "reply": "<AI text>" }
"""

from flask import Blueprint, request, jsonify
from services.chat_service import get_reply, clear_session

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}

    session_id = data.get("session_id", "").strip()
    message    = data.get("message", "").strip()

    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    if not message:
        return jsonify({"error": "message is required"}), 400

    try:
        reply = get_reply(session_id, message)
        return jsonify({"reply": reply})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@chat_bp.route("/api/chat/<session_id>", methods=["DELETE"])
def clear_chat(session_id):
    clear_session(session_id)
    return jsonify({"status": "cleared"})
