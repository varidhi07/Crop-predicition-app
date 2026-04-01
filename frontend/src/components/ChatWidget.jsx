import { useState } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";

const sampleMessages = [
  { role: "bot" , text: "Hello! I'm your FarmAssist AI. How can I help you today? 🌱" },
  { role: "user" , text: "What's the best crop for my soil?" },
  { role: "bot" , text: "Based on your soil data (N: 90, P: 42, K: 43, pH: 6.5), I'd recommend **Rice** as the top choice with 94% confidence. Cotton and Jute are also strong alternatives." },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg btn-glow transition-transform hover:scale-110 z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 h-130 glass-card flex flex-col z-50 animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Online
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {sampleMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {["Crop advice", "Soil analysis", "Weather forecast"].map((s) => (
              <button key={s} className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/30">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}