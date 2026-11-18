import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getStoredUser } from "../services/authService";
import { documentService } from "../services/documentService";
import MarkdownMessage from "../components/MarkdownMessage";

export default function AIChat() {
  const memberName = getStoredUser()?.name || "there";
  const location = useLocation();
  const requestedConversationId = location.state?.conversationId || null;
  const [messages, setMessages] = useState(() =>
    requestedConversationId
      ? []
      : [
          {
            id: "welcome",
            sender: "ai",
            text: `Hello ${memberName}! I am Infera AI. Ask me anything from your organisation's permitted documents.`,
          },
        ]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(
    requestedConversationId
  );
  const [loadedHistoryId, setLoadedHistoryId] = useState(null);
  const isLoadingHistory =
    Boolean(requestedConversationId) &&
    loadedHistoryId !== requestedConversationId;

  useEffect(() => {
    if (!requestedConversationId) return undefined;

    let active = true;
    documentService
      .getConversationMessages(requestedConversationId)
      .then((history) => {
        if (!active) return;
        setMessages(
          history.map((message) => ({
            id: message.id,
            sender: message.role === "user" ? "user" : "ai",
            text: message.content,
            sources: message.sources || [],
          }))
        );
      })
      .catch((error) => {
        if (active) {
          setMessages([
            {
              id: `history-error-${Date.now()}`,
              sender: "ai",
              text: `Could not load this conversation: ${error.message}`,
            },
          ]);
        }
      })
      .finally(() => {
        if (active) setLoadedHistoryId(requestedConversationId);
      });

    return () => {
      active = false;
    };
  }, [requestedConversationId]);

  const handleSend = async (event) => {
    event.preventDefault();

    const userText = input.trim();
    if (!userText || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: "user", text: userText },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await documentService.askQuestion({
        question: userText,
        conversationId,
      });
      setConversationId(response.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: "ai",
          text: response.answer || "The RAG service returned an empty answer.",
          sources: response.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "ai",
          text: `I couldn't retrieve an answer: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
        {isLoadingHistory && (
          <p className="text-center text-sm text-gray-500">Loading conversation...</p>
        )}
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
              {msg.sender === "user" ? (
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              ) : (
                <MarkdownMessage content={msg.text} />
              )}
              {msg.sources?.length > 0 && (
                <ul className="mt-2 list-inside list-disc border-t border-[#D7A781]/30 pt-2 text-xs">
                  {msg.sources.map((source) => (
                    <li key={`${msg.id}-${source.sourceId}`}>
                      {source.documentName}
                      {source.pageNumber ? ` · page ${source.pageNumber}` : ""}
                    </li>
                  ))}
                </ul>
              )}
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
          disabled={isLoading || isLoadingHistory}
          placeholder="Ask a question or say hello (e.g., 'Hi Infera')..."
          className="h-12 flex-1 rounded-xl border-2 border-[#D7A781]/50 bg-white px-4 text-sm text-[#722F37] outline-none focus:border-[#722F37]"
        />
        <button
          type="submit"
          disabled={isLoading || isLoadingHistory || !input.trim()}
          className="flex h-12 items-center gap-2 rounded-xl bg-[#722F37] px-6 font-semibold text-white hover:bg-[#5B242C] transition shadow-md"
        >
          <span>Send</span>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
