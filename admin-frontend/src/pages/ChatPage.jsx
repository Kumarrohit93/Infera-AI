import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  FileText,
  Inbox,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ragApi } from '../services/api';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import MarkdownMessage from '../components/MarkdownMessage';

export default function ChatPage() {
  const queryClient = useQueryClient();
  const messagesContainerRef = useRef(null);
  const [activeConvId, setActiveConvId] = useState(null);
  const [queryInput, setQueryInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [activeCitation, setActiveCitation] = useState(null);
  const [convToDelete, setConvToDelete] = useState(null);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const {
    data: conversations = [],
    isError: conversationsError,
    error: conversationsQueryError,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: ragApi.getConversations,
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isError: messagesError,
    error: messagesQueryError,
  } = useQuery({
    queryKey: ['conversation-messages', activeConvId],
    queryFn: () => ragApi.getConversationMessages(activeConvId),
    enabled: Boolean(activeConvId),
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (conversationsError) {
      toast.error(conversationsQueryError?.message || 'Failed to load conversations.');
    }
  }, [conversationsError, conversationsQueryError]);

  useEffect(() => {
    if (messagesError) {
      toast.error(messagesQueryError?.message || 'Failed to load conversation messages.');
    }
  }, [messagesError, messagesQueryError]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages.length, pendingMessages.length, isGenerating]);

  useEffect(() => {
    if (!activeCitation) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveCitation(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeCitation]);

  const handleSend = async (event) => {
    event.preventDefault();
    const question = queryInput.trim();
    if (!question || isGenerating) return;

    setQueryInput('');
    setIsGenerating(true);
    const pendingId = `pending-${Date.now()}`;
    setPendingMessages([
      { id: `${pendingId}-user`, role: 'user', content: question },
      { id: pendingId, role: 'assistant', content: '', sources: [] },
    ]);
    try {
      const result = await ragApi.askQuestionStream({
        question,
        ...(activeConvId ? { conversationId: activeConvId } : {}),
        onEvent(eventName, data) {
          if (eventName === 'start') setActiveConvId(data.conversationId);
          if (eventName === 'sources') {
            setPendingMessages((current) => current.map((message) =>
              message.id === pendingId
                ? { ...message, sources: data.sources || [] }
                : message
            ));
          }
          if (eventName === 'token') {
            setPendingMessages((current) => current.map((message) =>
              message.id === pendingId
                ? { ...message, content: message.content + data.token }
                : message
            ));
          }
          if (eventName === 'done') {
            setActiveConvId(data.conversationId);
            setPendingMessages((current) => current.map((message) =>
              message.id === pendingId
                ? { ...message, content: data.answer, sources: data.sources || [] }
                : message
            ));
          }
        },
      });
      setActiveConvId(result.conversationId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
        queryClient.invalidateQueries({
          queryKey: ['conversation-messages', result.conversationId],
        }),
      ]);
      setPendingMessages([]);
    } catch (error) {
      setQueryInput(question);
      setPendingMessages((current) => current.map((message) =>
        message.id === pendingId
          ? {
              ...message,
              content: error?.message || 'The assistant could not complete this request.',
            }
          : message
      ));
      toast.error(error?.message || 'Failed to query the assistant.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!convToDelete) return;
    try {
      await ragApi.deleteConversation(convToDelete.id);
      if (activeConvId === convToDelete.id) setActiveConvId(null);
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation deleted.');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete conversation.');
    } finally {
      setConvToDelete(null);
    }
  };

  return (
    <>
      <div className="h-[calc(100dvh-6.2rem)] sm:h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row bg-white border border-[#E8DCD1] rounded-[16px] sm:rounded-[20px] shadow-sm overflow-hidden">
        <aside
          className={`${
            showMobileHistory ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#E8DCD1] bg-[#FAF7F2]/60 flex-col shrink-0 min-h-0 max-h-[48dvh] lg:max-h-none`}
        >
          <div className="p-4 border-b border-[#E8DCD1]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveConvId(null);
                  setShowMobileHistory(false);
                }}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMobileHistory(false)}
                aria-label="Close recent chats"
                className="lg:hidden p-2.5 rounded-[10px] border border-[#E8DCD1] bg-white text-[#77716B] hover:text-[#25211E] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-[#77716B]">
              Answers use documents your administrator account is permitted to access.
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-sidebar-scroll p-3 space-y-1.5">
            <p className="px-2 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
              Recent Chats
            </p>
            {conversations.length === 0 ? (
              <div className="py-8 px-3 text-center">
                <Inbox className="w-8 h-8 text-[#96613F] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#25211E]">No conversations yet</p>
                <p className="text-[11px] text-[#77716B] mt-1">
                  Ask a question below to start a conversation.
                </p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-start justify-between gap-2 p-2.5 rounded-[10px] border transition-all duration-150 ${
                    activeConvId === conversation.id
                      ? 'bg-white border-[#E8DCD1] shadow-xs'
                      : 'border-transparent hover:bg-white/70 hover:border-[#E8DCD1]/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConvId(conversation.id);
                      setShowMobileHistory(false);
                    }}
                    disabled={isGenerating}
                    className="flex items-start gap-2 min-w-0 flex-1 text-left cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#96613F] transition-colors" />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-[#25211E] truncate">
                        {conversation.title}
                      </span>
                      <span className="block text-[10px] text-[#77716B] mt-1">
                        {conversation.updatedAt
                          ? new Date(conversation.updatedAt).toLocaleString()
                          : ''}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvToDelete(conversation)}
                    disabled={isGenerating}
                    aria-label={`Delete ${conversation.title}`}
                    title="Delete chat"
                    className="p-1 rounded-md text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-white">
          <header className="px-4 sm:px-6 py-3.5 border-b border-[#E8DCD1] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setShowMobileHistory((prev) => !prev)}
                className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#FAF7F2] border border-[#E8DCD1] text-[11px] font-semibold text-[#4A3023] shrink-0 active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#96613F]" />
                <span>Chats</span>
              </button>
              <h2 className="text-sm sm:text-base font-bold text-[#25211E] truncate">
                {conversations.find((conversation) => conversation.id === activeConvId)?.title || 'AI Assistant'}
              </h2>
            </div>
            <span className="hidden xs:inline text-[11px] text-[#77716B] shrink-0">
              Role-based document access
            </span>
          </header>

          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-sidebar-scroll p-4 sm:p-6 space-y-5 bg-[#FAF7F2]/30"
          >
            {isLoadingMessages ? (
              <div className="h-full flex items-center justify-center text-xs text-[#77716B]">
                Loading conversation...
              </div>
            ) : messages.length === 0 && pendingMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8 px-2"
              >
                <BookOpen className="w-10 h-10 text-[#96613F] mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-[#25211E]">
                  Query your knowledge base
                </h3>
                <p className="text-xs text-[#77716B] mt-2 leading-relaxed">
                  Ask a question to get an answer grounded in documents you can access.
                </p>
              </motion.div>
            ) : (
              [...messages, ...pendingMessages].map((message) => {
                const isUserMessage = message.role === 'user';
                const citations = message.sources || [];
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl p-4 rounded-[16px] shadow-xs transition-shadow duration-150 ${
                        isUserMessage
                          ? 'bg-[#96613F] text-white rounded-tr-none'
                          : 'bg-white border border-[#E8DCD1] text-[#25211E] rounded-tl-none'
                      }`}
                    >
                      {isUserMessage ? (
                        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed sm:text-sm">
                          {message.content}
                        </p>
                      ) : (
                        <MarkdownMessage content={message.content} />
                      )}
                      {!isUserMessage && citations.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-[#F3E8DC]">
                          <span className="text-[11px] font-bold text-[#77716B] block mb-2">
                            Sources ({citations.length})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {citations.map((citation, index) => (
                              <button
                                key={citation.sourceId || index}
                                type="button"
                                onClick={() => setActiveCitation(citation)}
                                className="text-left p-3 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1] hover:border-[#96613F] hover:-translate-y-0.5 hover:shadow-2xs transition-all duration-150 flex items-center gap-2 cursor-pointer"
                              >
                                <FileText className="w-4 h-4 text-[#96613F] shrink-0" />
                                <span className="min-w-0">
                                  <span className="block text-xs font-bold text-[#25211E] truncate">
                                    {citation.documentName}
                                  </span>
                                  <span className="text-[10px] text-[#77716B]">
                                    Page {citation.pageNumber ?? 'N/A'}
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <span
                        className={`block text-[10px] mt-2 ${
                          isUserMessage ? 'text-white/70 text-right' : 'text-[#77716B]'
                        }`}
                      >
                        {message.createdAt
                          ? new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
            {isGenerating && (
              <div className="text-xs text-[#77716B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#96613F] animate-pulse" />
                Searching your documents...
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t border-[#E8DCD1] shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                placeholder="Ask a question about your organization's documents..."
                className="flex-1 px-4 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[12px] text-xs sm:text-sm text-[#25211E] focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all duration-150"
              />
              <button
                type="submit"
                disabled={!queryInput.trim() || isGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold disabled:opacity-50 transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
              >
                <span>Ask</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>
      </div>

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
                  onClick={(event) => event.stopPropagation()}
                  className="bg-white border border-[#E8DCD1] rounded-[16px] max-w-lg w-full p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD1]">
                    <h3 className="font-bold text-sm text-[#25211E]">Source reference</h3>
                    <button
                      type="button"
                      onClick={() => setActiveCitation(null)}
                      aria-label="Close source reference"
                      className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-3 text-xs">
                    <p className="font-bold text-[#25211E]">{activeCitation.documentName}</p>
                    <p className="text-[#77716B]">
                      Page {activeCitation.pageNumber ?? 'N/A'}
                      {activeCitation.heading ? ` - ${activeCitation.heading}` : ''}
                    </p>
                    <p className="text-[#77716B]">
                      Similarity: {activeCitation.similarity ?? 'N/A'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <ConfirmDeleteModal
        isOpen={Boolean(convToDelete)}
        title="Delete Conversation"
        itemName={convToDelete?.title}
        description="This chat and its messages will be removed from your recent chats."
        confirmLabel="Delete"
        onCancel={() => setConvToDelete(null)}
        onConfirm={handleDeleteConversation}
      />
    </>
  );
}