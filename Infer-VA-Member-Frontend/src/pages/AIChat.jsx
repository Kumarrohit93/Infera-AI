import { useState } from "react";
import { Send } from "lucide-react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello Vibha! I am Infera AI. Ask me anything from your organisation's permitted documents.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getBotResponse = (userMsg) => {
    const cleanMsg = userMsg.trim().toLowerCase();
    const greetings = ["hi", "hii", "hiii", "hello", "hey", "good morning", "good afternoon"];

    if (greetings.includes(cleanMsg)) {
      return "Hello Vibha! 👋 How can I help you explore your workspace documents today?";
    }

    if (cleanMsg.includes("how are you")) {
      return "I'm operating at peak performance! What document or topic would you like to search today?";
    }

    return `Based on your permitted workspace documents, here is the relevant analysis regarding "${userMsg}". (Connect backend RAG API for live database retrieval.)`;
  };

  const handleSend = (event) => {
    event.preventDefault();

    const userText = input.trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const reply = getBotResponse(userText);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: reply }]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col bg-[#F8F4E7] rounded-3xl border border-[#D7A781]/30 p-4 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D7A781]/30 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#D7A781] p-1 shadow-sm">
            <img src="/infera-logo.jpeg" alt="Infera AI" className="h-full w-full object-contain rounded-lg" />
          </div>
          <div>
            <h2 className="font-bold text-[#722F37]">Infera Knowledge Assistant</h2>
            <p className="text-xs text-gray-500">RAG Engine • Secure Document Chat</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "ai" && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D7A781] bg-white p-1 shadow-sm">
                <img src="/infera-logo.jpeg" alt="Infera" className="h-full w-full object-contain rounded-lg" />
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-[#722F37] text-white"
                  : "bg-white text-[#722F37] border border-[#D7A781]/40"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D7A781] bg-white p-1">
              <img src="/infera-logo.jpeg" alt="Infera" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl bg-white px-4 py-3.5 border border-[#D7A781]/40 shadow-sm">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#722F37] [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#722F37] [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#722F37]" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex items-center gap-3 pt-2 border-t border-[#D7A781]/30">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or say hello (e.g., 'Hi Infera')..."
          className="h-12 flex-1 rounded-xl border-2 border-[#D7A781]/50 bg-white px-4 text-sm text-[#722F37] outline-none focus:border-[#722F37]"
        />
        <button
          type="submit"
          className="flex h-12 items-center gap-2 rounded-xl bg-[#722F37] px-6 font-semibold text-white hover:bg-[#5B242C] transition shadow-md"
        >
          <span>Send</span>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
