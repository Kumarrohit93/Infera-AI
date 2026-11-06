import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  Eye,
  MessageSquare,
  FileText,
  Clock,
  Inbox,
  X,
  AlertCircle,
  CheckCircle2
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

export default function FeedbackPage() {
  // Zero mock data - empty array by default (backend se aayega)
  const [feedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');

  // Inspect Modal State
  const [inspectingFeedback, setInspectingFeedback] = useState(null);

  // Calculations
  const totalCount = feedbacks.length;
  const helpfulCount = feedbacks.filter((f) => f.rating === 'Helpful').length;
  const unhelpfulCount = feedbacks.filter((f) => f.rating === 'Not Helpful').length;
  const helpfulPercentage = totalCount > 0 ? Math.round((helpfulCount / totalCount) * 100) : 0;

  // Search & Filter
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
            Audit team member ratings on AI responses and inspect low-scoring retrievals.
          </p>
        </div>
      </motion.div>

      {/* 2. Top Summary Metric Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Feedback */}
        <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">
                Total Ratings
              </p>
              <h3 className="text-2xl font-bold text-[#25211E] mt-1.5">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-[#77716B] mt-3 pt-3 border-t border-[#F3E8DC]">
            From active workspace chats
          </p>
        </div>

        {/* Helpful Satisfaction */}
        <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">
                Helpful Rate
              </p>
              <h3 className="text-2xl font-bold text-[#2B6141] mt-1.5">{helpfulPercentage}%</h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#EEF5F0] border border-[#CBE3D3] flex items-center justify-center text-[#2B6141] shrink-0">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-[#77716B] mt-3 pt-3 border-t border-[#F3E8DC]">
            {helpfulCount} positive ratings logged
          </p>
        </div>

        {/* Unhelpful / Needs Review */}
        <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 sm:col-span-3 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">
                Needs Review
              </p>
              <h3 className="text-2xl font-bold text-[#A83833] mt-1.5">{unhelpfulCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#FDF0EF] border border-[#F3C9C6] flex items-center justify-center text-[#A83833] shrink-0">
              <ThumbsDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-[#77716B] mt-3 pt-3 border-t border-[#F3E8DC]">
            Low relevance or missing citations
          </p>
        </div>
      </motion.div>

      {/* 3. Search Bar & Filter Controls */}
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

      {/* 4. Feedback Audit Table / Clean Empty State */}
      <motion.div
        variants={itemVariants}
        className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
      >
        {filteredFeedbacks.length === 0 ? (
          <div className="p-10 sm:p-14 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-3 shadow-inner">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#25211E]">
              {feedbacks.length === 0 ? 'No feedback recorded yet' : 'No matching feedback found'}
            </h4>
            <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
              {feedbacks.length === 0
                ? 'When team members interact with AI Chat and rate responses, audit logs will display here.'
                : 'Try clearing your search query or changing rating filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[620px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DCD1] text-[11px] font-bold text-[#77716B] uppercase tracking-wider">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">User Question</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Source Document</th>
                  <th className="px-4 py-3">Date</th>
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
                    <td className="px-4 py-3 text-xs text-[#77716B] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#96613F]" />
                      <span className="truncate max-w-[140px]">{item.sourceDoc}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#77716B]">{item.date}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectingFeedback(item)}
                        className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors"
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

      {/* 5. Inspection Modal */}
      {inspectingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-lg w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD1]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#96613F]" />
                <h3 className="font-bold text-sm sm:text-base text-[#25211E]">
                  Answer Quality Inspection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingFeedback(null)}
                className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="bg-[#FAF7F2] p-3.5 rounded-[12px] border border-[#E8DCD1] space-y-2">
                <div>
                  <span className="text-[#77716B] font-semibold">Asked By:</span>
                  <p className="font-bold text-[#25211E]">{inspectingFeedback.user}</p>
                </div>
                <div>
                  <span className="text-[#77716B] font-semibold">User Query:</span>
                  <p className="text-[#25211E] font-medium mt-0.5">"{inspectingFeedback.question}"</p>
                </div>
              </div>

              <div>
                <span className="text-[#77716B] font-semibold">AI Generated Response:</span>
                <p className="text-[#25211E] bg-[#FFFFFF] p-3 rounded-[10px] border border-[#E8DCD1] mt-1 leading-relaxed">
                  {inspectingFeedback.aiAnswer}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[8px] bg-[#FAF7F2] border border-[#E8DCD1]">
                  <span className="text-[#77716B]">User Rating:</span>
                  <div className="mt-1">
                    <StatusBadge status={inspectingFeedback.rating} />
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#FAF7F2] border border-[#E8DCD1]">
                  <span className="text-[#77716B]">Cited Source:</span>
                  <p className="font-bold text-[#25211E] truncate mt-1">
                    {inspectingFeedback.sourceDoc}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#E8DCD1] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingFeedback(null)}
                className="px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}