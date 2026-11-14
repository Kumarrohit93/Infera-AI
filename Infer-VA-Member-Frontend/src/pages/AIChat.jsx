import { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message & simulated zero-state response or empty state handler
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col rounded-3xl border border-[#D7A781]/30 bg-white shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="border-b border-gray-100 px-6 py-4 bg-[#722F37] text-white flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Infera AI Knowledge Assistant</h2>
          <p className="text-xs text-white/70">Ask questions grounded in permitted documents</p>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
          Ready
        </span>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F4E7]/40">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#722F37]/10 text-2xl text-[#722F37] mb-3">
              🤖
            </div>
            <h3 className="font-bold text-[#722F37]">How can I help you today?</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Ask anything about your organizational documents. Answers will include exact citations.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-[#722F37] text-white rounded-br-none"
                    : "bg-white text-[#722F37] border border-gray-200 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="border-t border-gray-200 bg-white p-4 flex gap-3">
        <input
          type="text"
          placeholder="Ask a question about your documents..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#722F37] outline-none focus:border-[#D7A781]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#722F37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5B242C]"
        >
          Send
        </button>
      </form>
    </div>
  );
}