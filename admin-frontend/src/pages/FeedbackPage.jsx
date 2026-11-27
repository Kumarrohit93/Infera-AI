import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from '../services/api';
import {
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  Eye,
  MessageSquare,
  FileText,
  Inbox,
  X,
  AlertCircle,
  Loader2,
  Reply,
  CheckCircle2,
  Send,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

// ----- Reply Modal -----
function ReplyModal({ feedback, onClose }) {
  const [replyText, setReplyText] = useState(feedback.adminReply || '');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => feedbackApi.replyToFeedback(feedback.id, replyText),
    onSuccess: () => {
      // Optimistically update the feedback list so the reply shows immediately
      queryClient.setQueryData(['feedback'], (old = []) =>
        old.map((f) =>
          f.id === feedback.id
            ? { ...f, adminReply: replyText, repliedAt: new Date().toISOString() }
            : f
        )
      );
      setSubmitted(true);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-lg w-full p-5 sm:p-6 shadow-2xl relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD1]">
          <div className="flex items-center gap-2">
            <Reply className="w-5 h-5 text-[#96613F]" />
            <h3 className="font-bold text-sm sm:text-base text-[#25211E]">
              Reply to Feedback
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-5 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-[#25211E]">Reply sent successfully!</p>
            <p className="text-xs text-[#77716B]">The member will see your reply on their Feedback page.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-[8px] bg-[#96613F] text-white text-xs font-semibold hover:bg-[#7A4F33] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Context */}
            <div className="bg-[#FAF7F2] rounded-[12px] border border-[#E8DCD1] p-3.5 space-y-2 text-xs">
              <div>
                <span className="text-[#77716B] font-semibold">Member:</span>
                <span className="ml-1 font-bold text-[#25211E]">{feedback.user}</span>
              </div>
              <div>
                <span className="text-[#77716B] font-semibold">Their Question:</span>
                <p className="text-[#25211E] font-medium mt-0.5">"{feedback.question}"</p>
              </div>
              <div>
                <span className="text-[#77716B] font-semibold">Rating:</span>
                <span className="ml-1">
                  <StatusBadge status={feedback.rating} />
                </span>
              </div>
              {feedback.comment && (
                <div>
                  <span className="text-[#77716B] font-semibold">Comment:</span>
                  <p className="text-[#25211E] mt-0.5">{feedback.comment}</p>
                </div>
              )}
            </div>

            {/* Reply textarea */}
            <div>
              <label className="text-xs font-semibold text-[#25211E] block mb-1.5">
                Your Reply
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={2000}
                placeholder="Write your reply to this feedback..."
                className="w-full p-3 rounded-[10px] border border-[#E8DCD1] text-xs text-[#25211E] bg-[#FAF7F2] focus:outline-none focus:border-[#96613F] transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error.message || 'Failed to send reply.'}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1 border-t border-[#E8DCD1]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !replyText.trim()}
                onClick={() => mutate()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#7A4F33] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Send Reply
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ----- Inspect Modal -----
function InspectModal({ feedback, onClose, onReply }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-lg w-full p-5 sm:p-6 shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD1]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#96613F]" />
            <h3 className="font-bold text-sm sm:text-base text-[#25211E]">
              Answer Quality Inspection
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          <div className="bg-[#FAF7F2] p-3.5 rounded-[12px] border border-[#E8DCD1] space-y-2">
            <div>
              <span className="text-[#77716B] font-semibold">Asked By:</span>
              <p className="font-bold text-[#25211E]">
                {feedback.user}
                {feedback.department && (
                  <span className="ml-1 font-normal text-[#77716B]">· {feedback.department}</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-[#77716B] font-semibold">User Query:</span>
              <p className="text-[#25211E] font-medium mt-0.5">"{feedback.question}"</p>
            </div>
          </div>

          <div>
            <span className="text-[#77716B] font-semibold">AI Generated Response:</span>
            <p className="text-[#25211E] bg-[#FFFFFF] p-3 rounded-[10px] border border-[#E8DCD1] mt-1 leading-relaxed">
              {feedback.aiAnswer}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-[8px] bg-[#FAF7F2] border border-[#E8DCD1]">
              <span className="text-[#77716B]">User Rating:</span>
              <div className="mt-1">
                <StatusBadge status={feedback.rating} />
              </div>
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#FAF7F2] border border-[#E8DCD1]">
              <span className="text-[#77716B]">Cited Source:</span>
              <p className="font-bold text-[#25211E] truncate mt-1">
                {feedback.sourceDoc}
              </p>
            </div>
          </div>

          {feedback.comment && (
            <div className="p-2.5 rounded-[8px] bg-[#FAF7F2] border border-[#E8DCD1]">
              <span className="text-[#77716B]">Member Comment:</span>
              <p className="text-[#25211E] mt-0.5">{feedback.comment}</p>
            </div>
          )}

          {/* Admin Reply section */}
          {feedback.adminReply ? (
            <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Reply className="w-3.5 h-3.5 text-amber-700" />
                <span className="font-semibold text-amber-700">Your Reply</span>
              </div>
              <p className="text-[#25211E] leading-relaxed">{feedback.adminReply}</p>
            </div>
          ) : (
            <div className="rounded-[10px] border border-[#E8DCD1] bg-[#FAF7F2] p-3 text-[#77716B] italic">
              No reply sent yet.
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[#E8DCD1] flex justify-between gap-2">
          <button
            type="button"
            onClick={() => { onClose(); onReply(feedback); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#7A4F33] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" />
            {feedback.adminReply ? 'Edit Reply' : 'Send Reply'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ----- Main Page -----
export default function FeedbackPage() {
  const { data: feedbacks = [], isLoading, isError, error } = useQuery({
    queryKey: ['feedback'],
    queryFn: feedbackApi.getFeedback,
    initialData: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [inspectingFeedback, setInspectingFeedback] = useState(null);
  const [replyingFeedback, setReplyingFeedback] = useState(null);

  const totalCount = feedbacks.length;
  const helpfulCount = feedbacks.filter((f) => f.rating === 'Helpful').length;
  const unhelpfulCount = feedbacks.filter((f) => f.rating === 'Not Helpful').length;
  const helpfulPercentage = totalCount > 0 ? Math.round((helpfulCount / totalCount) * 100) : 0;

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesSearch =
      (item.question && item.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.user && item.user.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRating = ratingFilter === 'All' || item.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-7 pb-10"
    >
      {/* 1. Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] tracking-tight">
            Answer Quality & Feedback
          </h2>
          <p className="text-xs sm:text-sm text-[#77716B] mt-1">
            Audit team member ratings on AI responses and reply to their feedback.
          </p>
        </div>
      </motion.div>

      {/* 2. Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="group bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-[#96613F]/40">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">Total Ratings</p>
              <h3 className="text-2xl font-bold text-[#25211E] mt-1.5 tracking-tight">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] shrink-0 transition-transform duration-200 group-hover:scale-105">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-[#77716B] mt-3 pt-3 border-t border-[#F3E8DC]">From active workspace chats</p>
        </div>

        <div className="group bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-[#2B6141]/40">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">Helpful Rate</p>
              <h3 className="text-2xl font-bold text-[#2B6141] mt-1.5 tracking-tight">{helpfulPercentage}%</h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#EEF5F0] border border-[#CBE3D3] flex items-center justify-center text-[#2B6141] shrink-0 transition-transform duration-200 group-hover:scale-105">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-[#77716B] mt-3 pt-3 border-t border-[#F3E8DC]">{helpfulCount} positive ratings logged</p>
        </div>

        <div className="group bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-[#A83833]/40">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">Needs Review</p>
              <h3 className="text-2xl font-bold text-[#A83833] mt-1.5 tracking-tight">{unhelpfulCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#FDF0EF] border border-[#F3C9C6] flex items-center justify-center text-[#A83833] shrink-0 transition-transform duration-200 group-hover:scale-105">
              <ThumbsDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-[#77716B] mt-3 pt-3 border-t border-[#F3E8DC]">Low relevance or missing citations</p>
        </div>
      </motion.div>

      {/* 3. Search & Filter */}
      <motion.div
        variants={itemVariants}
        className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        <div className="relative flex-1 max-w-full md:max-w-md">
          <Search className="w-4 h-4 text-[#77716B] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or member names..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#77716B]">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Rating:</span>
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-medium text-[#25211E] focus:outline-none focus:border-[#96613F]"
          >
            <option value="All">All Ratings</option>
            <option value="Helpful">Helpful</option>
            <option value="Not Helpful">Not Helpful</option>
          </select>
        </div>
      </motion.div>

      {/* 4. Feedback Table */}
      <motion.div
        variants={itemVariants}
        className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
      >
        {isLoading ? (
          <div className="p-12 text-center text-[#77716B] text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#96613F]" />
            <span>Loading answer feedback logs...</span>
          </div>
        ) : isError ? (
          <div className="p-10 sm:p-14 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDF0EF] border border-[#F3C9C6] flex items-center justify-center text-[#A83833] mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#25211E]">Feedback API unavailable</h4>
            <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
              {error?.message || 'The RAG backend does not currently provide a feedback endpoint.'}
            </p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-10 sm:p-14 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-3 shadow-inner">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#25211E]">
              {feedbacks.length === 0 ? 'No feedback recorded yet' : 'No matching feedback found'}
            </h4>
            <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
              {feedbacks.length === 0
                ? 'When team members rate AI responses, audit logs will display here.'
                : 'Try clearing your search query or changing rating filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DCD1] text-[11px] font-bold text-[#77716B] uppercase tracking-wider">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">User Question</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Source Document</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reply</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCD1]">
                {filteredFeedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-xs text-[#25211E]">
                      {item.user}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#25211E] max-w-xs truncate">
                      "{item.question}"
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.rating} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#77716B]">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#96613F] shrink-0" />
                        <span className="truncate max-w-[140px]">{item.sourceDoc}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#77716B]">
                      {item.date
                        ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setReplyingFeedback(item)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
                          item.adminReply
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-[#FAF7F2] text-[#96613F] border border-[#E8DCD1] hover:bg-[#F3E8DC]'
                        }`}
                        title="Send or edit reply"
                      >
                        <Reply className="w-3 h-3" />
                        {item.adminReply ? 'Replied' : 'Reply'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectingFeedback(item)}
                        className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-all duration-150 active:scale-90 cursor-pointer"
                        title="Inspect Response"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* 5. Inspect Modal */}
      <AnimatePresence>
        {inspectingFeedback && (
          <InspectModal
            feedback={inspectingFeedback}
            onClose={() => setInspectingFeedback(null)}
            onReply={(fb) => setReplyingFeedback(fb)}
          />
        )}
      </AnimatePresence>

      {/* 6. Reply Modal */}
      <AnimatePresence>
        {replyingFeedback && (
          <ReplyModal
            feedback={replyingFeedback}
            onClose={() => setReplyingFeedback(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}