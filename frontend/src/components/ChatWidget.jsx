import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, Trash2, Loader2 } from "lucide-react";

const FLASK_URL = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5001";

// ── Stable session ID (survives hot-reload, clears on tab close) ─────────────
function getSessionId() {
  let id = sessionStorage.getItem("chat_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("chat_session_id", id);
  }
  return id;
}

const WELCOME = {
  role: "bot",
  text: "👋 Hi! I'm your **FarmAssist AI**. Ask me about crop selection, fertilizers, soil health, yield predictions, or anything farming-related!",
};

const QUICK_REPLIES = [
  "Best crop for clay soil 🌾",
  "How to improve soil pH? 🧪",
  "Fertilizer tips for wheat 🌿",
  "Predict my yield 📊",
];

export function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);
  const sessionId             = useRef(getSessionId());

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch(`${FLASK_URL}/api/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ session_id: sessionId.current, message: userText }),
      });

      const data = await res.json();
      const reply = data.reply ?? data.error ?? "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Unable to reach the AI server. Please make sure the Flask backend is running." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  // ── Clear chat ──────────────────────────────────────────────────────────────
  const clearChat = useCallback(async () => {
    try {
      await fetch(`${FLASK_URL}/api/chat/${sessionId.current}`, { method: "DELETE" });
    } catch { /* ignore network errors on clear */ }
    setMessages([WELCOME]);
    setInput("");
  }, []);

  // ── Key handler ─────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render a single bubble ──────────────────────────────────────────────────
  function Bubble({ msg }) {
    const isUser = msg.role === "user";
    // Very light markdown: bold **text**
    const formatted = msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center mr-2 mt-0.5 shrink-0">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
        )}
        <div
          className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-secondary text-secondary-foreground rounded-bl-md"
          }`}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      </div>
    );
  }

  return (
    <>
      {/* ── Floating toggle button ───────────────────────────────────────── */}
      {!open && (
        <button
          id="chat-widget-toggle"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg btn-glow transition-transform hover:scale-110 z-50"
          title="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      {open && (
        <div
          id="chat-widget-panel"
          className="fixed bottom-6 right-6 w-96 flex flex-col z-50 animate-slide-up overflow-hidden glass-card"
          style={{ height: "32rem" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">FarmAssist AI</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {loading ? "Thinking…" : "Online · with memory"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                id="chat-clear-btn"
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                id="chat-close-btn"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick-reply chips */}
          {messages.length <= 1 && !loading && (
            <div className="px-3 pb-2 flex gap-2 overflow-x-auto shrink-0">
              {QUICK_REPLIES.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="p-3 border-t border-border/30 shrink-0">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about farming…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={loading}
              />
              <button
                id="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              Remembers your last 10 messages · powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>
      )}
    </>
  );
}