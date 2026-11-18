import { useEffect, useState } from "react";
import {
  MessageSquare,
  Trash2,
  Search,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../services/documentService";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ChatHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    documentService
      .getConversations()
      .then((conversations) => {
        if (active) setChats(conversations);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Failed to load chat history.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id) => {
    setError("");
    setDeletingId(id);
    try {
      await documentService.deleteConversation(id);
      setChats((currentChats) => currentChats.filter((chat) => chat.id !== id));
    } catch (requestError) {
      setError(requestError.message || "Failed to delete this conversation.");
    } finally {
      setDeletingId(null);
    }
  };

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(normalizedSearch) ||
      (chat.latestMessage || "").toLowerCase().includes(normalizedSearch)
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#722F37]">Chat History</h2>
          <p className="text-sm text-gray-600">
            Review, search, and continue your past AI document conversations
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#722F37]/60" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 w-full rounded-xl border border-[#D7A781]/50 bg-white pl-10 pr-4 text-sm text-[#722F37] shadow-sm outline-none focus:border-[#722F37]"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-3xl border border-[#D7A781]/30 bg-white/90 p-12 text-center text-sm text-gray-500 shadow-sm">
            Loading your conversations...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="rounded-3xl border border-[#D7A781]/30 bg-white/90 p-12 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-[#722F37]/40" />
            <h3 className="text-base font-bold text-[#722F37]">
              No conversations found
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {chats.length
                ? "Try a different search."
                : "Start a chat to see it saved here."}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <article
              key={chat.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-[#D7A781]/40 bg-white p-5 shadow-sm transition hover:border-[#722F37] sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-start gap-4 sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D7A781]/30 bg-[#F8F4E7] text-[#722F37]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-[#722F37]">
                    {chat.title || "New Conversation"}
                  </h3>
                  {chat.latestMessage && (
                    <p className="mt-1 truncate text-sm text-gray-600">
                      {chat.latestMessage}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDate(chat.updatedAt)}
                    </span>
                    <span>• {chat.messageCount} messages</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() =>
                    navigate("/chat", {
                      state: { conversationId: chat.id },
                    })
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-[#722F37] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5B242C]"
                >
                  <span>Open Chat</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(chat.id)}
                  disabled={deletingId === chat.id}
                  className="rounded-xl border border-gray-100 p-2.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Delete Chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
