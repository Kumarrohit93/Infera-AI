import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { History, MessageSquarePlus, PanelLeftClose, Send, Trash2, X } from "lucide-react";
import { documentService } from "../services/documentService";

const WELCOME_MESSAGE = {
  id: "welcome",
  sender: "ai",
  text: "Hello Vibha! I am Infera AI. Ask me anything from your organisation's permitted documents.",
};

function normalizeMessages(raw) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.messages)
      ? raw.messages
      : Array.isArray(raw?.data?.messages)
        ? raw.data.messages
        : [];

  return list.map((msg, idx) => ({
    id: msg.id ?? msg._id ?? `${Date.now()}-${idx}`,
    sender: msg.sender || (msg.role === "user" ? "user" : "ai"),
    text: msg.text ?? msg.content ?? msg.message ?? "",
  }));
}

function getConversationId(conv) {
  return conv?.id ?? conv?.conversationId ?? conv?._id;
}

function dedupeConversations(list) {
  const seen = new Set();
  const result = [];

  for (const item of list) {
    const id = String(getConversationId(item) ?? "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(item);
  }

  return result;
}

export default function AIChat() {
  const location = useLocation();
  const initialConvId = location.state?.conversationId || null;

  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Left-side Chat History panel state
  const [historyOpen, setHistoryOpen] = useState(Boolean(initialConvId));
  const [conversations, setConversations] = useState([]);
  const [localSessionMessages, setLocalSessionMessages] = useState({});
  const [activeConversationId, setActiveConversationId] = useState(initialConvId);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [deletingConvId, setDeletingConvId] = useState(null);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  const getBotResponse = (userMsg) => {
    const cleanMsg = userMsg.trim().toLowerCase();
    const greetings = ["hi", "hii", "hiii", "hello", "hey", "good morning", "good afternoon"];

    if (greetings.includes(cleanMsg)) {
      return "Hello Vibha! How can I help you explore your workspace documents today?";
    }
    if (cleanMsg.includes("how are you")) {
      return "I'm operating at peak performance! What document or topic would you like to search today?";
    }
    return `Based on your permitted workspace documents, here is the relevant analysis regarding "${userMsg}".`;
  };

  const loadConversations = async (syncedBackendId = null, syncedTitle = "") => {
    setIsLoadingConversations(true);
    try {
      const list = await documentService.getConversations();
      const backendItems = Array.isArray(list)
        ? list
        : Array.isArray(list?.conversations)
          ? list.conversations
          : [];

      const normalizedTitle = (syncedTitle || "").trim().toLowerCase();

      setConversations((prev) => {
        const remainingLocal = prev.filter((c) => {
          const idStr = String(getConversationId(c) ?? "");
          if (!idStr.startsWith("local-")) return false;

          if (syncedBackendId && idStr === String(syncedBackendId)) return false;
          const localTitle = (c.title || "").trim().toLowerCase();
          if (
            normalizedTitle &&
            localTitle === normalizedTitle &&
            backendItems.some(
              (b) => (b.title || "").trim().toLowerCase() === normalizedTitle
            )
          ) {
            return false;
          }
          return true;
        });

        return dedupeConversations([...remainingLocal, ...backendItems]);
      });
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const upsertLocalConversation = (convId, title, updatedMessages, replaceLocalId = null) => {
    setLocalSessionMessages((prev) => {
      const next = { ...prev, [convId]: updatedMessages };
      if (replaceLocalId && replaceLocalId !== convId) {
        delete next[replaceLocalId];
      }
      return next;
    });

    setConversations((prev) => {
      const filtered =
        replaceLocalId && replaceLocalId !== convId
          ? prev.filter((c) => String(getConversationId(c)) !== String(replaceLocalId))
          : prev;

      const exists = filtered.some((c) => String(getConversationId(c)) === String(convId));
      if (exists) {
        return dedupeConversations(
          filtered.map((c) =>
            String(getConversationId(c)) === String(convId)
              ? {
                  ...c,
                  title: c.title || title.slice(0, 45) || "Untitled Chat",
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      }

      return dedupeConversations([
        {
          id: convId,
          title: title.slice(0, 45) || "Untitled Chat",
          updatedAt: new Date().toISOString(),
        },
        ...filtered,
      ]);
    });
  };

  const handleSelectConversation = async (convId) => {
    if (!convId || isLoading || deletingConvId === convId) return;
    setActiveConversationId(convId);
    setError(null);

    if (String(convId).startsWith("local-") && localSessionMessages[convId]) {
      setMessages(localSessionMessages[convId]);
      return;
    }

    try {
      setIsLoading(true);
      const historyData = await documentService.getConversationMessages(convId);
      const formatted = normalizeMessages(historyData);
      if (formatted.length > 0) {
        setMessages(formatted);
      } else if (localSessionMessages[convId]) {
        setMessages(localSessionMessages[convId]);
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      if (localSessionMessages[convId]) {
        setMessages(localSessionMessages[convId]);
      } else {
        setError("Failed to load conversation messages from database.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!convId || deletingConvId) return;

    setError(null);
    setDeletingConvId(convId);

    try {
      if (
        !String(convId).startsWith("local-") &&
        typeof documentService.deleteConversation === "function"
      ) {
        await documentService.deleteConversation(convId);
      }
      setConversations((prev) =>
        prev.filter((conv) => String(getConversationId(conv)) !== String(convId))
      );
      setLocalSessionMessages((prev) => {
        const copy = { ...prev };
        delete copy[convId];
        return copy;
      });

      if (String(activeConversationId) === String(convId)) {
        setActiveConversationId(null);
        setMessages([{ ...WELCOME_MESSAGE, id: Date.now() }]);
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError(err?.message || "Failed to delete chat history.");
    } finally {
      setDeletingConvId(null);
    }
  };

  useEffect(() => {
    if (initialConvId) {
      handleSelectConversation(initialConvId);
    }
  }, [initialConvId]);

  const handleToggleHistory = () => {
    const nextState = !historyOpen;
    setHistoryOpen(nextState);
    if (nextState) {
      loadConversations(activeConversationId);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setError(null);
    setMessages([{ ...WELCOME_MESSAGE, id: Date.now() }]);
    if (historyOpen) {
      loadConversations();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const wasLocal = !activeConversationId || String(activeConversationId).startsWith("local-");
    const tempLocalId = wasLocal ? activeConversationId || `local-${Date.now()}` : null;
    const currentConvId = activeConversationId || tempLocalId;

    if (!activeConversationId) {
      setActiveConversationId(currentConvId);
    }

    const userMsgObj = { id: Date.now(), sender: "user", text: userText };
    const nextMessagesWithUser = [...messages, userMsgObj];

    setError(null);
    setMessages(nextMessagesWithUser);
    upsertLocalConversation(currentConvId, userText, nextMessagesWithUser);
    setInput("");
    setIsLoading(true);

    try {
      let replyText = "";
      let resolvedConvId = currentConvId;

      if (typeof documentService.sendChatMessage === "function") {
        const res = await documentService.sendChatMessage({
          message: userText,
          conversationId: String(currentConvId).startsWith("local-") ? null : currentConvId,
        });
        const backendConvId = res?.conversationId || res?.data?.conversationId;
        if (backendConvId) {
          resolvedConvId = backendConvId;
          setActiveConversationId(backendConvId);
        }
        replyText =
          res?.reply || res?.answer || res?.message || res?.data?.reply || getBotResponse(userText);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 650));
        replyText = getBotResponse(userText);
      }

      const aiMsgObj = { id: Date.now() + 1, sender: "ai", text: replyText };
      const finalMessages = [...nextMessagesWithUser, aiMsgObj];

      setMessages(finalMessages);
      upsertLocalConversation(
        resolvedConvId,
        userText,
        finalMessages,
        tempLocalId && resolvedConvId !== tempLocalId ? tempLocalId : null
      );

      if (typeof documentService.getConversations === "function") {
        loadConversations(resolvedConvId, userText);
      }
    } catch (err) {
      console.error("Chat send error:", err);
      setError(err?.message || "Failed to get response from AI service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden rounded-2xl border border-[#E8C8CC] bg-[#FDF6F6] shadow-sm">
      {/* LEFT SIDE: CHAT HISTORY SIDEBAR WITH INFERA AI LOGO & BRANDING */}
      <aside
        className={`flex min-h-0 shrink-0 flex-col border-r border-[#E8C8CC] bg-white transition-all duration-300 ease-in-out ${
          historyOpen ? "w-60 sm:w-64 opacity-100" : "w-0 overflow-hidden border-r-0 opacity-0"
        }`}
      >
        {/* Top Brand Header inside History Sidebar */}
        <div className="flex items-center justify-between gap-2 border-b border-[#F2DCE0] px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/infera-logo.jpeg"
              alt="InferaAi Logo"
              className="h-7 w-7 shrink-0 rounded-lg border border-[#E8C8CC] bg-[#FDF6F6] object-contain p-0.5"
            />
            <span className="truncate text-sm font-bold tracking-tight text-[#6E2D36]">
              InferaAi
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center gap-1 rounded-lg bg-[#9E4752] px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-[#853842]"
              title="New Chat"
            >
              <MessageSquarePlus className="h-3 w-3" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              className="rounded-lg p-1 text-[#8C6268] transition hover:bg-[#FDF6F6] hover:text-[#6E2D36]"
              aria-label="Close history"
              title="Hide History"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Chat History Subheader */}
        <div className="flex items-center gap-1.5 border-b border-[#F2DCE0] bg-[#FEF9F9] px-3 py-2 text-[11px] font-semibold text-[#7D3B44]">
          <History className="h-3.5 w-3.5 text-[#9E4752]" />
          <span>Chat History</span>
        </div>

        {/* Conversations List */}
        <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
          {isLoadingConversations && conversations.length === 0 ? (
            <div className="space-y-2 py-1">
              <div className="h-9 animate-pulse rounded-lg bg-[#FDF6F6]" />
              <div className="h-9 animate-pulse rounded-lg bg-[#FDF6F6]" />
              <div className="h-9 animate-pulse rounded-lg bg-[#FDF6F6]" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-2 text-center">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8E5E8] text-[#9E4752]">
                <History className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-[#6E2D36]">No Past Chats Yet</p>
              <p className="mt-1 text-[11px] text-[#8C6268]">
                Saved chats will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((conv) => {
                const convId = getConversationId(conv);
                const isActive = String(convId) === String(activeConversationId);
                const isDeleting = deletingConvId === convId;

                return (
                  <div
                    key={convId}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectConversation(convId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectConversation(convId);
                      }
                    }}
                    className={`group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-all duration-200 ${
                      isActive
                        ? "bg-[#F5E0E4] font-semibold text-[#5E232B] ring-1 ring-[#E3B8BE]"
                        : "text-[#6E2D36] hover:bg-[#FDF6F6]"
                    }`}
                  >
                    <p className="min-w-0 flex-1 truncate">
                      {conv.title || "Untitled Chat"}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, convId)}
                      disabled={isDeleting}
                      title="Delete Chat"
                      aria-label={`Delete ${conv.title || "chat"}`}
                      className={`shrink-0 rounded-md p-1 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isActive
                          ? "text-[#6E2D36] hover:bg-white/70 hover:text-rose-600"
                          : "text-[#A47A80] opacity-80 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* FULL-WIDTH MAIN CHAT AREA */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3.5 sm:p-5">
        {/* Top Bar with History & New Chat on the Left */}
        {!historyOpen && (
          <div className="mb-3 flex shrink-0 items-center justify-start border-b border-[#E8C8CC] pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleHistory}
                className="flex items-center gap-1.5 rounded-xl border border-[#E2B8BE] bg-white px-3 py-2 text-xs font-semibold text-[#6E2D36] transition hover:bg-[#F8E8EA]"
                title="Open Chat History"
              >
                <History className="h-4 w-4 text-[#9E4752]" />
                <span>History</span>
              </button>

              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1.5 rounded-xl border border-[#E2B8BE] bg-white px-3 py-2 text-xs font-semibold text-[#6E2D36] transition hover:bg-[#F8E8EA]"
              >
                <MessageSquarePlus className="h-4 w-4 text-[#9E4752]" />
                <span>New Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-3 flex shrink-0 items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700 transition-opacity duration-200">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-3 text-rose-500 hover:text-rose-800"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scrollable Messages Area Only */}
        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto pr-1.5 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 transition-all duration-300 ease-out ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs sm:max-w-[75%] ${
                  msg.sender === "user"
                    ? "border border-[#E3B8BE] bg-[#F3DADF] text-[#5A232B]"
                    : "border border-[#E8C8CC] bg-white text-[#5E232B]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Smooth Loading Skeleton + Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5 opacity-95 transition-opacity duration-300 ease-in-out">
              <div className="w-60 space-y-2 rounded-2xl border border-[#E8C8CC] bg-white px-4 py-3 shadow-xs">
                <div className="h-2.5 w-full animate-pulse rounded bg-[#F5E0E4]" />
                <div className="h-2.5 w-4/5 animate-pulse rounded bg-[#FAECEE]" />
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium text-[#7D3B44]">Thinking</span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9E4752]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D89BA3] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9E4752] [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <form
          onSubmit={handleSend}
          className="mt-3 flex shrink-0 items-center gap-2.5 border-t border-[#E8C8CC] pt-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a question or say hello (e.g., 'Hi Infera')..."
            className="h-11 flex-1 rounded-xl border border-[#E2B8BE] bg-white px-4 text-sm text-[#5E232B] placeholder-[#A47A80] outline-none transition focus:border-[#9E4752] focus:ring-2 focus:ring-[#9E4752]/15 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#9E4752] px-5 font-semibold text-white shadow-xs transition hover:bg-[#853842] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <span>Send</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}