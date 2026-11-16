import { useState } from "react";
import { MessageSquare, Trash2, Search, ArrowUpRight, Clock, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock Chat History Data
  const [chats, setChats] = useState([
    { id: "c1", title: "Q3 Financial Audit Summary", folder: "Finance Docs", date: "Today, 11:30 AM", messagesCount: 8 },
    { id: "c2", title: "Employee Leave & Remote Policy", folder: "HR Guidelines", date: "Yesterday", messagesCount: 5 },
    { id: "c3", title: "API Authentication Architecture", folder: "Engineering", date: "Nov 12, 2026", messagesCount: 14 },
    { id: "c4", title: "Security Compliance Checklist", folder: "Legal & Admin", date: "Oct 28, 2026", messagesCount: 6 },
  ]);

  const handleDelete = (id) => {
    setChats(chats.filter((chat) => chat.id !== id));
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.folder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#722F37]">Chat History</h2>
          <p className="text-sm text-gray-600">Review, search, and continue your past AI document conversations</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#722F37]/60" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#D7A781]/50 bg-white pl-10 pr-4 text-sm text-[#722F37] outline-none focus:border-[#722F37] shadow-sm"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="space-y-3">
        {filteredChats.length === 0 ? (
          <div className="rounded-3xl border border-[#D7A781]/30 bg-white/90 p-12 text-center shadow-sm">
            <MessageSquare className="mx-auto h-12 w-12 text-[#722F37]/40 mb-3" />
            <h3 className="text-base font-bold text-[#722F37]">No conversations found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or start a new chat.</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#D7A781]/40 bg-white p-5 shadow-sm hover:border-[#722F37] transition"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8F4E7] text-[#722F37] border border-[#D7A781]/30">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#722F37] text-base">{chat.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 rounded-md bg-[#D7A781]/20 px-2.5 py-1 font-semibold text-[#722F37]">
                      <FolderKanban className="h-3 w-3" /> {chat.folder}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {chat.date}
                    </span>
                    <span>• {chat.messagesCount} messages</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => navigate("/chat")}
                  className="flex items-center gap-1.5 rounded-xl bg-[#722F37] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5B242C] transition shadow-sm"
                >
                  <span>Open Chat</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(chat.id)}
                  className="rounded-xl p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition border border-gray-100"
                  title="Delete Chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}