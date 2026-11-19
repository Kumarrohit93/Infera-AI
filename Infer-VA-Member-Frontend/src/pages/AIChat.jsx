import { useEffect, useRef, useState } from "react";
import { History, MessageSquarePlus, PanelRightClose, Send, X } from "lucide-react";
import { documentService } from "../services/documentService";

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

  // Embedded Chat History panel state (empty by default, no dummy data)
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const list = await documentService.getConversations();
      setConversations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error loading conversations:", err);
      // Non-blocking error for conversation list
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleToggleHistory = () => {
    const nextState = !historyOpen;
    setHistoryOpen(nextState);
    if (nextState && conversations.length === 0) {
      loadConversations();
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setError(null);
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text: "Hello Vibha! I am Infera AI. Ask me anything from your organisation's permitted documents.",
      },
    ]);
    setHistoryOpen(false);
  };

  // Select a Conversation: Load its persistent messages and citations
  const handleSelectConversation = async (convId) => {
    if (convId === activeConversationId || isLoading) return;
    setActiveConversationId(convId);
    setError(null);
    setHistoryOpen(false);

    try {
      setIsLoading(true);
      const historyMessages = await documentService.getConversationMessages(convId);
      setMessages(Array.isArray(historyMessages) ? historyMessages : []);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load conversation messages from database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setError(null);
    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    // Smooth AI response transition
    setTimeout(() => {
      const reply = getBotResponse(userText);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: reply }]);
      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="relative flex h-[calc(100vh-6rem)] overflow-hidden rounded-3xl border border-[#D7A781]/30 bg-[#F8F4E7] shadow-sm">
      {/* MAIN CHAT PANEL */}
      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#D7A781]/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D7A781] bg-white p-1 shadow-sm">
              <img
                src="/infera-logo.jpeg"
                alt="Infera AI"
                className="h-full w-full rounded-lg object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-[#722F37]">Infera Knowledge Assistant</h2>
              <p className="text-xs text-gray-500">RAG Engine • Secure Document Chat</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center gap-1.5 rounded-xl border border-[#D7A781]/60 bg-white px-3 py-2 text-xs font-semibold text-[#722F37] transition hover:bg-[#D7A781]/20"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button
              type="button"
              onClick={handleToggleHistory}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                historyOpen
                  ? "border-[#722F37] bg-[#722F37] text-white"
                  : "border-[#D7A781]/60 bg-white text-[#722F37] hover:bg-[#D7A781]/20"
              }`}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        </div>

        {/* Error Banner (if any) */}
        {error && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 transition-opacity duration-200">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-3 text-red-500 hover:text-red-800"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 transition-all duration-300 ease-out ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D7A781] bg-white p-1 shadow-sm">
                  <img
                    src="/infera-logo.jpeg"
                    alt="Infera"
                    className="h-full w-full rounded-lg object-contain"
                  />
                </div>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-[#722F37] text-white"
                    : "border border-[#D7A781]/40 bg-white text-[#722F37]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Smooth Loading Phase */}
          {isLoading && (
            <div className="flex items-center gap-3 opacity-95 transition-opacity duration-300 ease-in-out">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D7A781] bg-white p-1 shadow-sm">
                <img
                  src="/infera-logo.jpeg"
                  alt="Infera"
                  className="h-full w-full rounded-lg object-contain"
                />
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-[#D7A781]/40 bg-white px-4 py-3 shadow-sm">
                <span className="text-xs font-medium text-[#722F37]/75">Thinking</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#722F37]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D7A781] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#722F37] [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <form
          onSubmit={handleSend}
          className="mt-4 flex items-center gap-3 border-t border-[#D7A781]/30 pt-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a question or say hello (e.g., 'Hi Infera')..."
            className="h-12 flex-1 rounded-xl border-2 border-[#D7A781]/50 bg-white px-4 text-sm text-[#722F37] outline-none transition focus:border-[#722F37] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-12 items-center gap-2 rounded-xl bg-[#722F37] px-5 sm:px-6 font-semibold text-white shadow-md transition hover:bg-[#5B242C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>Send</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* EMBEDDED CHAT HISTORY SIDEBAR / DRAWER */}
      <aside
        className={`flex flex-col border-l border-[#D7A781]/30 bg-white/95 transition-all duration-300 ease-in-out ${
          historyOpen ? "w-72 sm:w-80 opacity-100" : "w-0 overflow-hidden border-l-0 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#D7A781]/30 px-4 py-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#722F37]" />
            <h3 className="text-sm font-bold text-[#722F37]">Chat History</h3>
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen(false)}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-[#F8F4E7] hover:text-[#722F37]"
            aria-label="Close history"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoadingConversations ? (
            <div className="space-y-2.5 py-2">
              <div className="h-11 animate-pulse rounded-xl bg-[#F8F4E7]" />
              <div className="h-11 animate-pulse rounded-xl bg-[#F8F4E7]" />
              <div className="h-11 animate-pulse rounded-xl bg-[#F8F4E7]" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#722F37]/10 text-[#722F37]">
                <History className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-[#722F37]">No Past Chats Yet</p>
              <p className="mt-1 text-[11px] text-gray-500">
                Your saved conversations will appear here once available.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-left text-xs transition ${
                      isActive
                        ? "bg-[#722F37] font-semibold text-white shadow-sm"
                        : "text-[#722F37] hover:bg-[#F8F4E7]"
                    }`}
                  >
                    <p className="truncate">{conv.title || "Untitled Chat"}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}