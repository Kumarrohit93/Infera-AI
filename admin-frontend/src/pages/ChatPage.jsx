import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { folderApi } from '../services/api';
import {
  Plus,
  Send,
  Sparkles,
  FileText,
  ThumbsUp,
  ThumbsDown,
  X,
  MessageSquare,
  BookOpen,
  Inbox,
  FolderKanban,
  Trash2
} from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Sync live folders with FoldersPage / DocumentsPage cache (Zero Mock Data)
  const { data: serverFolders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      try {
        const res = await folderApi.getFolders();
        return Array.isArray(res) ? res : [];
      } catch {
        return queryClient.getQueryData(['folders']) ?? [];
      }
    },
    initialData: () => queryClient.getQueryData(['folders']) ?? [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  const folderNames = serverFolders
    .map((f) => (typeof f === 'string' ? f : f?.name))
    .filter(Boolean);

  // Retrieval Scope ('All' or specific folder name)
  const [retrievalScope, setRetrievalScope] = useState('All');

  // Keep scope valid if a folder gets deleted
  useEffect(() => {
    if (retrievalScope !== 'All' && !folderNames.includes(retrievalScope)) {
      setRetrievalScope('All');
    }
  }, [folderNames, retrievalScope]);

  // Conversations List (Zero Mock Data - starts empty)
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || null;
  const messages = activeConversation?.messages || [];

  // Input & Modal States
  const [queryInput, setQueryInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCitation, setActiveCitation] = useState(null);
  const [convToDelete, setConvToDelete] = useState(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isGenerating]);

  // Close citation modal on Escape
  useEffect(() => {
    if (!activeCitation) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveCitation(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeCitation]);

  // Handle + New Chat
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      title: 'New Conversation',
      folder: retrievalScope === 'All' ? 'All Folders' : retrievalScope,
      time: 'Just now',
      messages: []
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
    toast.success('Started a new chat session.');
  };

  const handleSelectConv = async (convId) => {
    if (convId === activeConvId || isLoadingMessages || isGenerating) return;
    setActiveConvId(convId);
  };

  // Handle Delete Conversation
  const handleDeleteConv = (convId) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
    }
    toast.success('Conversation deleted.');
  };

  // Handle Send Question
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = queryInput.trim();
    if (!query || isGenerating) return;

    const scopeLabel = retrievalScope === 'All' ? 'All Folders' : retrievalScope;
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let targetId = activeConvId;

    if (!targetId) {
      targetId = `conv-${Date.now()}`;
      const newConv = {
        id: targetId,
        title: query.length > 32 ? `${query.slice(0, 32)}...` : query,
        folder: scopeLabel,
        time: 'Just now',
        messages: [userMessage]
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(targetId);
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === targetId
            ? {
                ...conv,
                title:
                  conv.title === 'New Conversation'
                    ? query.length > 32
                      ? `${query.slice(0, 32)}...`
                      : query
                    : conv.title,
                time: 'Just now',
                messages: [...conv.messages, userMessage]
              }
            : conv
        )
      );
    }

    setQueryInput('');
    setIsGenerating(true);

    // Replace with POST /api/chat when backend RAG endpoint is ready
    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on your indexed organization documents in ${scopeLabel}:\n\nHere is the verified guidance for: "${query}". Documented procedures specify that team members must follow standard approval policies.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userRating: null,
        citations: Array.isArray(result.sources)
          ? result.sources.map((s) => ({
              id: s.sourceId,
              title: s.documentName,
              score: `${Math.round((s.similarity || 0.8) * 100)}%`,
              excerpt: `Section: ${s.heading || 'General'} | Page: ${s.pageNumber || 'N/A'}`
            }))
          : []
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === targetId
            ? { ...conv, messages: [...conv.messages, aiResponse] }
            : conv
        )
      );
      setMessages((prev) => [...prev, aiResponse]);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      console.error('RAG Error:', err);
      toast.error(err?.message || 'Failed to query RAG assistant');
    } finally {
      setIsGenerating(false);
    }
  };

  // Feedback Handler
  const handleRating = (messageId, rating) => {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConvId
          ? {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === messageId ? { ...m, userRating: rating } : m
              )
            }
          : conv
      )
    );
    toast.success(`Feedback recorded: ${rating}`);
  };

  return (
    <>
      <div className="h-[calc(100dvh-6.2rem)] sm:h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] sm:rounded-[20px] shadow-sm overflow-hidden relative">
        {/* ================= LEFT SIDEBAR: CONVERSATIONS ================= */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[#E8DCD1] bg-[#FAF7F2]/60 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-[#E8DCD1]">
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
  const handleRating = () => {
    toast.error('Response ratings are not yet supported by the RAG backend.');
  };

  return (
    <div className="h-[calc(100dvh-6.2rem)] sm:h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] sm:rounded-[20px] shadow-sm overflow-hidden relative">
      {/* ================= LEFT SIDEBAR PANEL: CONVERSATION LIST ================= */}
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

          <p className="mt-3.5 text-[11px] leading-relaxed text-[#77716B]">
            Answers use the documents your administrator account is permitted to access.
          </p>
        </div>

          <div className="flex-1 overflow-y-auto custom-sidebar-scroll p-3 space-y-1.5 max-h-44 lg:max-h-none">
            <p className="px-2 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
              Recent Chats
            </p>

            {conversations.length === 0 ? (
              <div className="py-8 lg:py-12 px-3 text-center">
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
                  <div
                    key={conv.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectConv(conv.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectConv(conv.id);
                      }
                    }}
                    className={`group w-full text-left p-2.5 rounded-[10px] border transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-white border-[#E8DCD1] shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-white/70 hover:border-[#E8DCD1]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isActive ? 'text-[#96613F]' : 'text-[#77716B]'
                          }`}
                        />
                        <p
                          className={`text-xs font-semibold truncate ${
                            isActive ? 'text-[#25211E]' : 'text-[#77716B]'
                          }`}
                        >
                          {conv.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#96613F] border border-[#E8DCD1]">
                          {conv.folder}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConvToDelete(conv);
                          }}
                          aria-label={`Delete ${conv.title}`}
                          title="Delete Chat"
                          className="p-1 rounded-md text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#77716B] mt-1 pl-5.5">{conv.time}</p>
                  </div>
                );
              })
            )}
          </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#96613F] border border-[#E8DCD1] shrink-0">
                      {conv.messageCount || 0} messages
                    </span>
                  </div>
                  <p className="text-[10px] text-[#77716B] mt-1.5 pl-6">
                    {conv.updatedAt ? new Date(conv.updatedAt).toLocaleString() : ''}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* ================= RIGHT MAIN CHAT VIEWPORT ================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
          {/* Minimal Header */}
          <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-[#E8DCD1] flex items-center justify-between gap-2 shrink-0">
            <h3 className="text-sm sm:text-base font-bold text-[#25211E] tracking-tight truncate">
              {activeConversation ? activeConversation.title : 'Test AI'}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1] shrink-0">
              <FolderKanban className="w-3 h-3 text-[#96613F]" />
              {retrievalScope === 'All' ? 'All Folders' : retrievalScope}
            </span>
          </div>

          {/* Messages Stream / Clean Empty State */}
          <div className="flex-1 overflow-y-auto custom-sidebar-scroll p-4 sm:p-6 space-y-5 bg-[#FAF7F2]/30">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8 px-2">
                <div className="w-12 h-12 rounded-2xl bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] shadow-sm mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#25211E] tracking-tight">
                  Test Knowledge Base Retrieval
                </h3>
                <p className="text-xs text-[#77716B] mt-1.5 leading-relaxed">
                  Ask questions grounded exclusively in your indexed organization documents. Real-time citations and source page cards will appear here.
                </p>
          </div>
          <span className="hidden sm:inline text-[11px] text-[#77716B] shrink-0">
            Role-based document access
          </span>
        </div>

        {/* Messages Stream / Clean Empty State */}
        <div className="flex-1 overflow-y-auto custom-sidebar-scroll p-4 sm:p-6 space-y-6 bg-[#FAF7F2]/30">
          {isLoadingMessages ? (
            <div className="h-full flex items-center justify-center text-xs text-[#77716B]">
              Loading conversation…
            </div>
          ) : messages.length === 0 ? (
            /* Clean Center Welcome Banner (Zero fake messages) */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-10">
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] shadow-sm mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'user' ? (
                    <div className="max-w-2xl bg-[#96613F] text-white px-4 py-3 rounded-[16px] rounded-tr-none text-xs sm:text-sm font-medium shadow-xs leading-relaxed">
                      <p>{msg.text}</p>
                      <span className="block text-[10px] text-white/70 text-right mt-1">
                        {msg.time}
                      </span>
                    </div>
                  ) : (
                    <div className="max-w-3xl bg-white border border-[#E8DCD1] p-4 sm:p-5 rounded-[16px] rounded-tl-none shadow-xs space-y-3.5">
                      <p className="text-xs sm:text-sm text-[#25211E] leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-[#F3E8DC]">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#77716B] block mb-2">
                            Verified Sources ({msg.citations.length})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {msg.citations.map((cite, i) => (
                              <div
                                key={cite.id || i}
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
                                  View →
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2.5 border-t border-[#F3E8DC] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#77716B]">
                        <span>{msg.time}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="hidden sm:inline">Helpful?</span>
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
              <div className="max-w-2xl bg-white border border-[#E8DCD1] p-4 sm:p-5 rounded-[16px] rounded-tl-none shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#77716B]">
                  <Sparkles className="w-4 h-4 text-[#96613F] animate-spin" />
                  <span>Searching vector embeddings and formulating answer...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-[#F3E8DC]/80 rounded-full animate-pulse w-full" />
                  <div className="h-3 bg-[#FAF7F2] rounded-full animate-pulse w-4/5" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Unified Bottom Input Bar with Inline Live Folder Scope */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#E8DCD1] shrink-0">
            <form
              onSubmit={handleSend}
              className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-4xl mx-auto"
            >
              <div className="relative shrink-0">
                <select
                  value={retrievalScope}
                  onChange={(e) => setRetrievalScope(e.target.value)}
                  aria-label="Knowledge retrieval folder scope"
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[12px] text-xs font-semibold text-[#25211E] focus:outline-none focus:border-[#96613F] transition-colors cursor-pointer"
                >
                  <option value="All">All Folders</option>
                  {folderNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#77716B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2 flex-1">
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
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Source Citation Modal (Portal to document.body) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeCitation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setActiveCitation(null)}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
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
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Delete Chat Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(convToDelete)}
        title="Delete Conversation"
        itemName={convToDelete?.title}
        description="This chat and its messages will be removed from your recent chats."
        confirmLabel="Delete"
        onCancel={() => setConvToDelete(null)}
        onConfirm={() => {
          if (convToDelete) {
            handleDeleteConv(convToDelete.id);
            setConvToDelete(null);
          }
        }}
      />
    </>
  );
}