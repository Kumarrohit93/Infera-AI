import { useState, useRef, useEffect } from "react";
import { documentService } from "../services/documentService";

export default function AIChat() {
  // Conversation List & Active Selection
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Chat Messages & Input
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSourceModal, setActiveSourceModal] = useState(null);

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chatEndRef = useRef(null);

  // 1. Initial Load: Fetch User's Conversations from PostgreSQL
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const list = await documentService.getConversations();
      setConversations(list);
    } catch (err) {
      console.error("Error loading conversations:", err);
      // Non-blocking error for conversation list
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // 2. Select a Conversation: Load its persistent messages and citations
  const handleSelectConversation = async (convId) => {
    if (convId === activeConversationId || isLoading) return;
    setActiveConversationId(convId);
    setError(null);
    setSidebarOpen(false);

    try {
      setIsLoading(true);
      const historyMessages = await documentService.getConversationMessages(convId);
      setMessages(historyMessages);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load conversation messages from database.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. New Chat Button
  const handleNewChat = () => {
    if (isLoading) return;
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setInput("");
    setSidebarOpen(false);
  };

  // 4. Delete Conversation
  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (isLoading) return;

    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      await documentService.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));

      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError("Failed to delete conversation.");
    }
  };

  // 5. Send Question (RAG with persistent history)
  const handleSend = async (e) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    setError(null);
    setInput("");

    // Optimistically append user message to UI
    const tempUserMsg = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const result = await documentService.askQuestion({
        question: query,
        conversationId: activeConversationId || undefined,
      });

      // Assistant message with verified citations
      const assistantMsg = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: result.answer,
        sources: Array.isArray(result.sources) ? result.sources : [],
        totalResults: result.totalResults || 0,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If this was a new conversation, set active ID and refresh sidebar
      if (!activeConversationId && result.conversationId) {
        setActiveConversationId(result.conversationId);
      }
      loadConversations();
    } catch (err) {
      console.error("RAG Query Error:", err);
      setError(err.message || "Failed to generate answer from documents.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format inline citations like [1], [2] as clickable pills
  const renderFormattedAnswer = (text, sources = []) => {
    if (!text) return null;
    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, idx) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const sourceNum = Number(match[1]);
        const matchedSource = sources.find((s) => s.sourceId === sourceNum);

        return (
          <button
            key={idx}
            type="button"
            onClick={() => matchedSource && setActiveSourceModal(matchedSource)}
            title={matchedSource ? `${matchedSource.documentName} (Section: ${matchedSource.heading || "General"})` : `Source [${sourceNum}]`}
            className="inline-flex items-center justify-center mx-1 px-1.5 py-0.5 text-xs font-semibold rounded bg-[#722F37]/10 text-[#722F37] hover:bg-[#722F37] hover:text-white transition-colors cursor-pointer border border-[#722F37]/20 align-baseline"
          >
            [{sourceNum}]
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] rounded-3xl border border-[#D7A781]/30 bg-white shadow-sm overflow-hidden relative">
      {/* ======================================================== */}
      {/* 1. LEFT CONVERSATION SIDEBAR                            */}
      {/* ======================================================== */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out absolute md:relative z-20 w-72 h-full bg-[#FAF7F2] border-r border-[#D7A781]/30 flex flex-col`}
      >
        {/* Sidebar Header + New Chat Button */}
        <div className="p-4 border-b border-[#D7A781]/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#722F37] uppercase tracking-wider flex items-center gap-2">
              <span>💬 Chats</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#722F37]/10 text-[#722F37]">
                {conversations.length}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-800 p-1"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#722F37] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#5B242C] transition cursor-pointer active:scale-98"
          >
            <span>+</span>
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {isLoadingConversations ? (
            <div className="p-4 text-center text-xs text-gray-400">Loading chat history...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No previous conversations. Start a new chat!
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl text-left transition cursor-pointer border ${
                    isSelected
                      ? "bg-white border-[#D7A781] shadow-xs text-[#722F37]"
                      : "border-transparent hover:bg-white/70 text-gray-700"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-[#722F37]" : "text-gray-800"}`}>
                      {conv.title || "Untitled Conversation"}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {conv.latestMessage || "No messages yet"}
                    </p>
                  </div>

                  <button
                    type="button"
                    title="Delete Conversation"
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-600 text-gray-400 p-1 transition"
                  >
                    🗑️
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. RIGHT CHAT MAIN AREA                                 */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Chat Top Header */}
        <div className="border-b border-gray-100 px-6 py-4 bg-[#722F37] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white/80 hover:text-white p-1 rounded-lg border border-white/20"
            >
              ☰
            </button>
            <div>
              <h2 className="font-bold text-base md:text-lg flex items-center gap-2">
                <span>Infera AI Knowledge Assistant</span>
                <span className="hidden sm:inline-block text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/20 text-white/90">
                  Multi-Document RAG
                </span>
              </h2>
              <p className="text-xs text-white/70">
                Answers strictly grounded in your permitted organizational documents
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F4E7]/40">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#722F37]/10 text-3xl text-[#722F37] mb-3 shadow-inner">
                🤖
              </div>
              <h3 className="font-bold text-lg text-[#722F37]">Enterprise Multi-Document Search</h3>
              <p className="text-sm text-gray-600 max-w-md mt-1">
                Ask questions across all documents you have been granted access to. The AI will synthesize information from multiple sources and cite every reference.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
                {[
                  "Explain Node.js event loop architecture",
                  "What are the backend security guidelines?",
                  "Summarize key requirements from all company notes",
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setInput(sample);
                    }}
                    className="rounded-xl border border-[#D7A781]/50 bg-white px-3.5 py-2 text-xs font-medium text-[#722F37] hover:bg-[#722F37] hover:text-white transition shadow-sm"
                  >
                    &ldquo;{sample}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#722F37] text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-none"
                  }`}
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/10">
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${msg.role === "user" ? "text-white/80" : "text-[#722F37]"}`}>
                      {msg.role === "user" ? "You" : "Infera AI"}
                    </span>
                    <span className={`text-[10px] ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap">
                    {msg.role === "user" ? msg.content : renderFormattedAnswer(msg.content, msg.sources)}
                  </div>

                  {/* Sources Panel */}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs font-bold text-[#722F37] flex items-center gap-1 mb-2">
                        📚 Verified Document Sources ({msg.sources.length})
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {msg.sources.map((src) => (
                          <div
                            key={src.sourceId}
                            onClick={() => setActiveSourceModal(src)}
                            className="flex flex-col justify-between p-2.5 rounded-xl border border-gray-100 bg-[#FDFBF7] hover:bg-white hover:border-[#D7A781] transition cursor-pointer shadow-2xs group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#722F37] text-[10px] font-bold text-white">
                                {src.sourceId}
                              </span>
                              <span className="text-xs font-semibold text-gray-800 truncate flex-1 group-hover:text-[#722F37]">
                                {src.documentName}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                              <span className="truncate max-w-[120px]">
                                {src.heading || "General"}
                              </span>
                              <span className="shrink-0 font-medium">
                                {src.pageNumber ? `Pg ${src.pageNumber}` : "Page N/A"}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center justify-between pt-1 border-t border-gray-100/60 text-[10px] text-[#96613F]">
                              <span>Similarity Match</span>
                              <span className="font-bold">
                                {Math.round((src.similarity || 0) * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty Sources Notice */}
                  {msg.role === "assistant" && (!msg.sources || msg.sources.length === 0) && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200/60">
                      ℹ️ No relevant passages could be retrieved from your authorized documents.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl rounded-bl-none border border-gray-200 bg-white px-5 py-4 text-sm shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#722F37] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-[#722F37] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-[#722F37] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    Searching authorized company documents & synthesizing answer...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-start justify-between gap-3 shadow-xs">
              <div>
                <p className="font-bold text-xs uppercase tracking-wide text-rose-900">Query Failed</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs text-rose-500 hover:text-rose-800 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Source Detail Modal */}
        {activeSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#722F37] text-white mb-1">
                    SOURCE [{activeSourceModal.sourceId}]
                  </span>
                  <h3 className="font-bold text-gray-900 text-base">
                    {activeSourceModal.documentName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSourceModal(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="font-semibold text-gray-700">Section / Heading:</span>
                  <span>{activeSourceModal.heading || "General"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="font-semibold text-gray-700">Page Number:</span>
                  <span>{activeSourceModal.pageNumber !== null ? activeSourceModal.pageNumber : "Not available (DOCX / TXT)"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="font-semibold text-gray-700">Vector Similarity:</span>
                  <span className="font-bold text-[#722F37]">{Math.round((activeSourceModal.similarity || 0) * 100)}% Match</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="font-semibold text-gray-700">Document UUID:</span>
                  <span className="font-mono text-[10px] text-gray-500 truncate max-w-[220px]">{activeSourceModal.documentId}</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSourceModal(null)}
                  className="rounded-xl bg-[#722F37] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5B242C] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="border-t border-gray-200 bg-white p-4 flex gap-3 items-center">
          <input
            type="text"
            placeholder={
              activeConversationId
                ? "Ask a follow-up question..."
                : "Ask a question across all your authorized documents..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#722F37] outline-none focus:border-[#D7A781] transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-[#722F37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5B242C] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
          >
            {isLoading ? "Searching..." : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}
