import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Send,
  Sparkles,
  FileText,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  X,
  ShieldCheck,
  MessageSquare,
  BookOpen,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const messagesEndRef = useRef(null);

  // Left Panel: Retrieval Scope
  const [retrievalScope, setRetrievalScope] = useState('All Folders (Global Index)');

  // Conversations List (ZERO MOCK DATA - Shuruat mein bilkul empty array)
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);

  // Active Chat Messages State (ZERO MOCK DATA)
  const [messages, setMessages] = useState([]);

  // Input & Modal States
  const [queryInput, setQueryInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCitation, setActiveCitation] = useState(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle + New Chat
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      title: 'New Conversation',
      folder: retrievalScope.includes('HR')
        ? 'HR'
        : retrievalScope.includes('IT')
        ? 'IT'
        : 'General',
      time: 'Just now'
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
    setMessages([]);
    toast.success('Started a new chat session.');
  };

  // Handle Select Conversation
  const handleSelectConv = (convId) => {
    setActiveConvId(convId);
    // Jab backend API se connect hoga toh yahan se specific conversation messages fetch honge
  };

  // Handle Send Question
  const handleSend = (e) => {
    if (e) e.preventDefault();
    const query = queryInput.trim();
    if (!query || isGenerating) return;

    // Agar koi conversation active nahi hai toh pehle nayi conversation bana lo
    let currentId = activeConvId;
    if (!currentId) {
      currentId = `conv-${Date.now()}`;
      const newConv = {
        id: currentId,
        title: query.length > 32 ? `${query.slice(0, 32)}...` : query,
        folder: retrievalScope.split(' ')[0] || 'General',
        time: 'Just now'
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(currentId);
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setQueryInput('');
    setIsGenerating(true);

    // Baad mein yeh setTimeout sidha aapke backend API (e.g. POST /api/chat) se replace hoga
    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on your indexed organization documents in ${retrievalScope}:\n\nHere is the verified guidance for: "${query}". Documented procedures specify that team members must follow standard approval policies.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userRating: null,
        citations: []
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsGenerating(false);
    }, 1000);
  };

  // Feedback Handler
  const handleRating = (messageId, rating) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, userRating: rating } : m))
    );
    toast.success(`Feedback recorded: ${rating}`);
  };

  return (
    <div className="h-[calc(100dvh-6.2rem)] sm:h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] sm:rounded-[20px] shadow-sm overflow-hidden relative">
      {/* ================= LEFT SIDEBAR PANEL: CONVERSATION LIST & SCOPE ================= */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#E8DCD1] bg-[#FAF7F2]/60 flex flex-col shrink-0">
        {/* + New Chat Button */}
        <div className="p-4 border-b border-[#E8DCD1]">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Knowledge Retrieval Scope Selector */}
          <div className="mt-3.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#77716B] mb-1.5">
              Knowledge Retrieval Scope
            </label>
            <div className="relative">
              <select
                value={retrievalScope}
                onChange={(e) => setRetrievalScope(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-[#E8DCD1] rounded-[8px] text-xs font-semibold text-[#25211E] focus:outline-none focus:border-[#96613F] transition-colors cursor-pointer"
              >
                <option value="All Folders (Global Index)">All Folders (Global Index)</option>
                <option value="HR Folder Only">HR Folder Only</option>
                <option value="IT Folder Only">IT Folder Only</option>
                <option value="Finance Folder Only">Finance Folder Only</option>
                <option value="Operations Folder Only">Operations Folder Only</option>
                <option value="General Folder Only">General Folder Only</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#77716B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Recent Conversations List / Clean Empty State */}
        <div className="flex-1 overflow-y-auto custom-sidebar-scroll p-3 space-y-1.5">
          <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
            Recent Conversations
          </p>

          {conversations.length === 0 ? (
            <div className="py-12 px-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-2.5 shadow-inner">
                <Inbox className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#25211E]">No conversations yet</p>
              <p className="text-[11px] text-[#77716B] mt-1 leading-relaxed">
                Click "+ New Chat" or type a question below to begin querying.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConvId === conv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConv(conv.id)}
                  className={`w-full text-left p-3 rounded-[12px] border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white border-[#E8DCD1] shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-white/70 hover:border-[#E8DCD1]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#96613F]' : 'text-[#77716B]'
                        }`}
                      />
                      <p
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-[#25211E]' : 'text-[#77716B]'
                        }`}
                      >
                        {conv.title}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#96613F] border border-[#E8DCD1] shrink-0">
                      {conv.folder}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#77716B] mt-1.5 pl-6">{conv.time}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT MAIN CHAT VIEWPORT ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
        {/* Header Bar */}
        <div className="p-4 sm:px-6 bg-white border-b border-[#E8DCD1] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-[#25211E] tracking-tight truncate">
              {activeConvId
                ? conversations.find((c) => c.id === activeConvId)?.title || 'Active Session'
                : 'Infera AI Knowledge Playground'}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1] shrink-0">
              Scope: {retrievalScope.split(' ')[0]}
            </span>
          </div>
          <span className="hidden sm:inline text-[11px] text-[#77716B] shrink-0">
            Strict Citation Mode • Zero Mock Data
          </span>
        </div>

        {/* Messages Stream / Clean Empty State */}
        <div className="flex-1 overflow-y-auto custom-sidebar-scroll p-4 sm:p-6 space-y-6 bg-[#FAF7F2]/30">
          {messages.length === 0 ? (
            /* Clean Center Welcome Banner (Zero fake messages) */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-10">
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] shadow-sm mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#25211E] tracking-tight">
                Test Knowledge Base Retrieval
              </h3>
              <p className="text-xs text-[#77716B] mt-1.5 leading-relaxed">
                Ask questions grounded exclusively in your indexed organization documents. Real-time citations and source page cards will appear here.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'user' ? (
                  /* User Bubble */
                  <div className="max-w-2xl bg-[#96613F] text-white p-4 rounded-[16px] rounded-tr-none text-xs sm:text-sm font-medium shadow-xs leading-relaxed">
                    <p>{msg.text}</p>
                    <span className="block text-[10px] text-white/70 text-right mt-1.5">
                      {msg.time}
                    </span>
                  </div>
                ) : (
                  /* AI Answer Card */
                  <div className="max-w-3xl bg-white border border-[#E8DCD1] p-5 sm:p-6 rounded-[16px] rounded-tl-none shadow-xs space-y-4">
                    <p className="text-xs sm:text-sm text-[#25211E] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {/* Citations Box (Rendered dynamically if present) */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-[#F3E8DC]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#77716B] block mb-2">
                          Verified Source Citations ({msg.citations.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.citations.map((cite, i) => (
                            <div
                              key={i}
                              onClick={() => setActiveCitation(cite)}
                              className="group p-3 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1] hover:border-[#96613F] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xs cursor-pointer flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="w-4 h-4 text-[#96613F] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#25211E] truncate">
                                    {cite.name}
                                  </p>
                                  <span className="text-[10px] text-[#77716B]">
                                    Page {cite.page}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[11px] font-semibold text-[#96613F] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">
                                View Source →
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating Bar */}
                    <div className="pt-3 border-t border-[#F3E8DC] flex items-center justify-between text-[11px] text-[#77716B]">
                      <span>{msg.time}</span>
                      <div className="flex items-center gap-3">
                        <span>Was this answer accurate?</span>
                        <button
                          type="button"
                          onClick={() => handleRating(msg.id, 'Helpful')}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-all duration-150 active:scale-95 cursor-pointer ${
                            msg.userRating === 'Helpful'
                              ? 'text-[#2B6141] font-bold bg-[#EEF5F0]'
                              : 'hover:text-[#25211E]'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRating(msg.id, 'Not Helpful')}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-all duration-150 active:scale-95 cursor-pointer ${
                            msg.userRating === 'Not Helpful'
                              ? 'text-[#A83833] font-bold bg-[#FDF0EF]'
                              : 'hover:text-[#25211E]'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Not Helpful</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing / Indexing Skeleton */}
          {isGenerating && (
            <div className="max-w-2xl bg-white border border-[#E8DCD1] p-5 rounded-[16px] rounded-tl-none shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#77716B]">
                <Sparkles className="w-4 h-4 text-[#96613F] animate-spin" />
                <span>Searching vector embeddings and formulating answer...</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-[#FAF7F2] rounded-full animate-pulse w-full" />
                <div className="h-3 bg-[#FAF7F2] rounded-full animate-pulse w-4/5" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Query Bar at Bottom */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E8DCD1] shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask a question about your organization's documents..."
              className="flex-1 px-4 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[12px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all duration-150"
            />
            <button
              type="submit"
              disabled={!queryInput.trim() || isGenerating}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 disabled:opacity-50 active:scale-95 shadow-sm cursor-pointer shrink-0"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Source Citation Modal */}
      <AnimatePresence>
        {activeCitation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-lg w-full p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD1]">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-[#96613F] shrink-0" />
                  <h3 className="font-bold text-sm sm:text-base text-[#25211E] truncate">
                    Verified Source Reference Card
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCitation(null)}
                  className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                <div className="bg-[#FAF7F2] p-3 rounded-[10px] border border-[#E8DCD1]">
                  <p className="font-bold text-[#25211E]">{activeCitation.name}</p>
                  <p className="text-[11px] text-[#77716B] mt-0.5">
                    Page {activeCitation.page}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[#25211E] block mb-1">
                    Retrieved Text Chunk Excerpt:
                  </span>
                  <p className="p-3.5 bg-white border border-[#E8DCD1] rounded-[10px] text-[#25211E] leading-relaxed italic">
                    "{activeCitation.excerpt}"
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[#E8DCD1] flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveCitation(null)}
                  className="px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Reference
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}