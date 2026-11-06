import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Bot,
  User,
  FileText,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronDown,
  X,
  ShieldCheck,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fullStackInterviewQuestions,
  initialInterviewConversation,
  generateFullStackResponse
} from '../data/chatMockData';

// Framer motion variants
const messageVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15 }
  }
};

export default function ChatPage() {
  const messagesEndRef = useRef(null);

  // Department Folder Target for RAG Context
  const [selectedFolder, setSelectedFolder] = useState('IT');
  const [queryInput, setQueryInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Citation modal state
  const [activeCitation, setActiveCitation] = useState(null);

  // Loaded with realistic Full Stack Developer Interview conversation history
  const [messages, setMessages] = useState(initialInterviewConversation);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Send Query Handler (Uses Mock RAG Engine from chatMockData)
  const handleSendMessage = (textToSend) => {
    const query = (textToSend || queryInput).trim();
    if (!query || isGenerating) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setQueryInput('');
    setIsGenerating(true);

    // Dynamic response generation from mock data
    setTimeout(() => {
      const generated = generateFullStackResponse(query, selectedFolder);

      const aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: generated.text,
        citations: generated.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userRating: null
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsGenerating(false);
    }, 900);
  };

  // Feedback on AI message
  const handleRating = (messageId, rating) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, userRating: rating } : msg
      )
    );
    toast.success(`Marked as ${rating}. Telemetry recorded.`);
  };

  // Reset chat back to initial state
  const handleResetChat = () => {
    setMessages(initialInterviewConversation);
    toast.success('Chat history reset to sample interview conversation.');
  };

  return (
    <div className="h-[calc(100dvh-6.2rem)] sm:h-[calc(100vh-6.5rem)] flex flex-col bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] sm:rounded-[20px] shadow-sm overflow-hidden relative">
      {/* 1. Chat Header Bar with Folder Target & Model Badge */}
      <div className="h-14 sm:h-16 px-3.5 sm:px-6 bg-gradient-to-r from-white via-white to-[#FAF7F2] border-b border-[#E8DCD1] flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] bg-[#96613F] text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-base font-bold text-[#25211E] truncate">
                Full Stack Interview RAG Tester
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF5F0] text-[#2B6141] border border-[#CBE3D3] shrink-0">
                <ShieldCheck className="w-3 h-3" />
                Live Mock Engine
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#77716B] truncate">
              Testing candidate interview knowledge retrieval
            </p>
          </div>
        </div>

        {/* Right Controls: Folder Selector + Reset Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#77716B] hover:text-[#4A3023] border border-[#E8DCD1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to Initial Interview Q&A"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="relative">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="appearance-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1.5 bg-[#FAF7F2] hover:bg-[#F3E8DC]/50 border border-[#E8DCD1] rounded-[8px] text-[11px] sm:text-xs font-bold text-[#25211E] focus:outline-none focus:border-[#96613F] transition-colors cursor-pointer"
            >
              <option value="IT">IT / Engineering</option>
              <option value="HR">HR Policies</option>
              <option value="General">General Folder</option>
              <option value="All Folders">All Folders</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#77716B] absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-5 bg-[#FAF7F2]/40">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className={`flex gap-2.5 sm:gap-4 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#4A3023] text-white'
                    : 'bg-[#96613F] text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1.5 sm:space-y-2 max-w-[88%] sm:max-w-[82%]">
                <div
                  className={`p-3.5 sm:p-4 rounded-[14px] sm:rounded-[16px] text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#96613F] text-white rounded-tr-none'
                      : 'bg-white text-[#25211E] border border-[#E8DCD1] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* AI Citations and Feedback Controls */}
                {msg.sender === 'ai' && (
                  <div className="space-y-1.5 pt-1">
                    {/* Citations Badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#77716B]">Verified Citations:</span>
                        {msg.citations.map((cite, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveCitation(cite)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1] hover:border-[#96613F] text-[10px] sm:text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-[#96613F]" />
                            <span>{cite.docName} • p. {cite.page}</span>
                            <span className="text-[9px] sm:text-[10px] text-[#2B6141] font-bold">
                              ({Math.round(cite.similarity * 100)}% match)
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Helpful / Not Helpful Buttons */}
                    <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-[#77716B]">
                      <span>Was this technical answer accurate?</span>
                      <button
                        type="button"
                        onClick={() => handleRating(msg.id, 'Helpful')}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                          msg.userRating === 'Helpful'
                            ? 'text-[#2B6141] font-bold bg-[#EEF5F0]'
                            : 'hover:text-[#25211E]'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Helpful</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRating(msg.id, 'Not Helpful')}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                          msg.userRating === 'Not Helpful'
                            ? 'text-[#A83833] font-bold bg-[#FDF0EF]'
                            : 'hover:text-[#25211E]'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Needs Review</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing / Retrieval Loader Indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5 sm:gap-3 max-w-xl"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#96613F] text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="p-3 sm:p-3.5 rounded-[14px] rounded-tl-none bg-white border border-[#E8DCD1] text-xs flex items-center gap-2 text-[#77716B] shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#96613F]" />
              <span className="truncate">Retrieving technical vector chunks from {selectedFolder}...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Interview Question Chips (Quick Test) */}
      <div className="px-3 sm:px-4 py-2 bg-[#FAF7F2] border-t border-[#E8DCD1] flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#77716B] shrink-0">
          Quick Questions:
        </span>
        {fullStackInterviewQuestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSendMessage(item.query)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F3E8DC] border border-[#E8DCD1] hover:border-[#96613F] text-[11px] font-semibold text-[#25211E] whitespace-nowrap transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 3. Input Query Form Bar (Responsive) */}
      <div className="p-2.5 sm:p-4 bg-white border-t border-[#E8DCD1] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={`Ask any full stack question (e.g. Node.js event loop, React Virtual DOM, SQL vs NoSQL)...`}
            className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] sm:rounded-[12px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-white focus:outline-none focus:border-[#96613F] transition-colors"
          />

          <button
            type="submit"
            disabled={!queryInput.trim() || isGenerating}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-[10px] sm:rounded-[12px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 disabled:opacity-50 active:scale-95 shadow-sm cursor-pointer shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </form>
      </div>

      {/* 4. Citation Inspection Modal */}
      <AnimatePresence>
        {activeCitation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-md w-full p-5 sm:p-6 shadow-2xl relative"
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
                <div className="bg-[#FAF7F2] p-3 rounded-[10px] border border-[#E8DCD1] space-y-1">
                  <p className="font-bold text-[#25211E]">{activeCitation.docName}</p>
                  <p className="text-[11px] text-[#77716B]">
                    Folder: <span className="font-semibold text-[#4A3023]">{activeCitation.folder}</span> • Page {activeCitation.page} • Similarity: {Math.round(activeCitation.similarity * 100)}%
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[#25211E] block mb-1">
                    Retrieved Text Chunk Excerpt:
                  </span>
                  <p className="p-3 bg-white border border-[#E8DCD1] rounded-[10px] text-[#25211E] leading-relaxed italic">
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