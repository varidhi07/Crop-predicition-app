"""
chat_service.py
───────────────
Manages per-session conversation history using the modern LangChain
RunnableWithMessageHistory API (no deprecated ConversationChain/Memory).

LLM: Gemini 1.5 Flash via langchain-google-genai.
Memory: In-memory ChatMessageHistory keyed by session_id (last 10 turns).

Usage:
    from services.chat_service import get_reply, clear_session
"""

import os
import warnings
import operator
from typing import Sequence

# Suppress legacy SDK deprecation noise
warnings.filterwarnings("ignore", category=FutureWarning, module="langchain_google_genai")

from dotenv import load_dotenv
load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.messages import SystemMessage, trim_messages, BaseMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory

# ── LLM ──────────────────────────────────────────────────────────────────────
_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.7,
)

# ── System persona ────────────────────────────────────────────────────────────
_SYSTEM = """You are FarmAssist AI, a helpful, friendly, and knowledgeable agricultural assistant.
You help farmers with:
- Crop selection and recommendations based on soil and climate conditions
- Fertilizer advice (type, quantity, timing)
- Yield prediction insights
- Soil health and quality improvement
- Pest and disease management
- Weather impact on farming
- Sustainable and organic farming practices

Keep answers concise (2-4 sentences unless more detail is genuinely needed).
When the user refers to something mentioned earlier (e.g. "that crop", "its water needs"),
use the conversation history to understand what they mean.
If you don't know something specific, say so honestly and suggest consulting a local agronomist."""

# ── Prompt template ───────────────────────────────────────────────────────────
_prompt = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

# ── Session store: { session_id → InMemoryChatMessageHistory } ────────────────
_store: dict[str, InMemoryChatMessageHistory] = {}

# Keep only the last 10 Human+AI pairs = 20 messages
_trimmer = trim_messages(
    max_tokens=20,
    strategy="last",
    token_counter=len,         # count by message count, not tokens
    include_system=False,
    allow_partial=False,
    start_on="human",
)


def _get_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in _store:
        _store[session_id] = InMemoryChatMessageHistory()
    return _store[session_id]


# ── Runnable chain ────────────────────────────────────────────────────────────
_chain = _prompt | _llm

_chain_with_history = RunnableWithMessageHistory(
    _chain,
    _get_history,
    input_messages_key="input",
    history_messages_key="history",
)


def get_reply(session_id: str, user_message: str) -> str:
    """Returns the AI reply, maintaining per-session conversation history."""
    config = {"configurable": {"session_id": session_id}}
    response = _chain_with_history.invoke(
        {"input": user_message},
        config=config,
    )
    return response.content.strip()


def clear_session(session_id: str) -> None:
    """Clears a session's history so the next message starts fresh."""
    _store.pop(session_id, None)
