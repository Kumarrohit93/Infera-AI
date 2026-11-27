import { useState, useEffect } from "react";
import {
  MessageSquarePlus,
  ThumbsUp,
  ThumbsDown,
  Send,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Reply,
  Loader2,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { documentService } from "../services/documentService";

// ----- Rating Badge -----
function RatingBadge({ rating }) {
  const isHelpful = rating === "Helpful";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        isHelpful
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-rose-50 text-rose-700 border border-rose-200"
      }`}
    >
      {isHelpful ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
      {rating}
    </span>
  );
}

// ----- Past Feedback Card -----
function FeedbackCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-[#E8C8CC] bg-white shadow-sm transition hover:shadow-md">
      {/* Header Row */}
      <div
        className="flex cursor-pointer items-start justify-between gap-3 p-5"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#5E232B]">
            "{item.question}"
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <RatingBadge rating={item.rating} />
            {item.adminReply && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8E5E8] px-2 py-0.5 text-[11px] font-semibold text-[#9E4752]">
                <Reply className="h-3 w-3" />
                Admin replied
              </span>
            )}
            <span className="text-[11px] text-[#A47A80]">
              {new Date(item.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="mt-0.5 shrink-0 rounded-lg p-1 text-[#9E4752] transition hover:bg-[#F8E5E8]"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-[#F8E5E8] px-5 pb-5 pt-4 space-y-4">
          {/* AI Answer */}
          <div>
            <p className="mb-1 text-xs font-semibold text-[#8C6268]">AI Answer</p>
            <p className="rounded-xl border border-[#F0D8DB] bg-[#FDF6F6] p-3 text-xs text-[#5E232B] leading-relaxed">
              {item.aiAnswer}
            </p>
          </div>

          {/* Source & Comment */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {item.sourceDoc && item.sourceDoc !== "No citation" && (
              <div className="flex items-center gap-2 rounded-xl border border-[#E8C8CC] bg-[#FDF6F6] px-3 py-2.5">
                <FileText className="h-4 w-4 shrink-0 text-[#9E4752]" />
                <div>
                  <p className="text-[10px] font-semibold text-[#8C6268]">Source</p>
                  <p className="text-xs font-medium text-[#5E232B] truncate max-w-[180px]">{item.sourceDoc}</p>
                </div>
              </div>
            )}
            {item.comment && (
              <div className="rounded-xl border border-[#E8C8CC] bg-[#FDF6F6] px-3 py-2.5">
                <p className="text-[10px] font-semibold text-[#8C6268]">Your Comment</p>
                <p className="text-xs text-[#5E232B] mt-0.5">{item.comment}</p>
              </div>
            )}
          </div>

          {/* Admin Reply */}
          {item.adminReply ? (
            <div className="rounded-xl border border-[#E8C8CC] bg-[#FFF0F2] px-4 py-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Reply className="h-3.5 w-3.5 text-[#9E4752]" />
                <p className="text-xs font-semibold text-[#9E4752]">Admin Reply</p>
              </div>
              <p className="text-xs text-[#5E232B] leading-relaxed">{item.adminReply}</p>
              {item.repliedAt && (
                <p className="text-[10px] text-[#A47A80]">
                  {new Date(item.repliedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-[#A47A80] italic">
              No admin reply yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ----- Rate New Response Section -----
function RateResponseSection({ onRated }) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState("");
  const [selectedMsgId, setSelectedMsgId] = useState("");
  const [helpful, setHelpful] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Load conversations on mount
  useEffect(() => {
    setLoading(true);
    documentService
      .getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load AI messages when conversation selected
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      setSelectedMsgId("");
      return;
    }
    documentService
      .getConversationMessages(selectedConvId)
      .then((msgs) => {
        // Show only assistant messages (the AI answers that can be rated)
        setMessages(msgs.filter((m) => m.role === "assistant"));
        setSelectedMsgId("");
      })
      .catch(() => setMessages([]));
  }, [selectedConvId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedMsgId || helpful === null) return;
    setSubmitting(true);
    setError("");
    try {
      await documentService.submitFeedback(selectedMsgId, { helpful, comment });
      setSubmitted(true);
      onRated?.();
    } catch (err) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="mt-3 text-base font-bold text-emerald-900">Thank you!</h2>
        <p className="mt-1 text-sm text-emerald-700">Your rating has been saved.</p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setHelpful(null);
            setComment("");
            setSelectedMsgId("");
            setSelectedConvId("");
          }}
          className="mt-4 rounded-xl bg-[#9E4752] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#722F37]"
        >
          Rate Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Step 1: Pick conversation */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#5E232B]">
          1. Select a Conversation
        </label>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#8C6268]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading conversations…
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-[#8C6268]">
            No conversations yet. Start a chat with the AI first.
          </p>
        ) : (
          <select
            value={selectedConvId}
            onChange={(e) => setSelectedConvId(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#E2B8BE] bg-[#FDF6F6] px-4 text-sm text-[#5E232B] outline-none focus:border-[#9E4752]"
          >
            <option value="">— Choose a conversation —</option>
            {conversations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || "Conversation"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Step 2: Pick AI message */}
      {selectedConvId && messages.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#5E232B]">
            2. Select an AI Response to Rate
          </label>
          <select
            value={selectedMsgId}
            onChange={(e) => setSelectedMsgId(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#E2B8BE] bg-[#FDF6F6] px-4 text-sm text-[#5E232B] outline-none focus:border-[#9E4752]"
          >
            <option value="">— Choose an AI answer —</option>
            {messages.map((m) => (
              <option key={m.id} value={m.id}>
                {(m.content || "").slice(0, 90)}…
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Rate */}
      {selectedMsgId && (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#5E232B]">
              3. Was this answer helpful?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setHelpful(true)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${
                  helpful === true
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-[#E2B8BE] bg-[#FDF6F6] text-[#8C6268] hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                Helpful
              </button>
              <button
                type="button"
                onClick={() => setHelpful(false)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${
                  helpful === false
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-[#E2B8BE] bg-[#FDF6F6] text-[#8C6268] hover:border-rose-300 hover:bg-rose-50"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                Not Helpful
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#5E232B]">
              4. Additional Comments (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Why was this answer helpful or not? Any extra context..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              className="w-full rounded-xl border border-[#E2B8BE] bg-[#FDF6F6] p-3 text-sm text-[#5E232B] placeholder-[#A47A80] outline-none focus:border-[#9E4752]"
            />
          </div>
        </>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {selectedMsgId && helpful !== null && (
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#9E4752] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#722F37] disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit Rating
        </button>
      )}
    </form>
  );
}

// ----- Main Feedback Page -----
export default function Feedback() {
  const [myFeedback, setMyFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState("");
  const [activeTab, setActiveTab] = useState("history"); // 'history' | 'rate'

  function loadMyFeedback() {
    setFeedbackLoading(true);
    setFeedbackError("");
    documentService
      .getMyFeedback()
      .then(setMyFeedback)
      .catch((err) => setFeedbackError(err.message || "Failed to load feedback."))
      .finally(() => setFeedbackLoading(false));
  }

  useEffect(() => {
    loadMyFeedback();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div className="rounded-3xl border border-[#E8C8CC] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E5E8] text-[#9E4752]">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#5E232B]">AI Feedback</h1>
            <p className="text-sm text-[#8C6268]">
              Rate AI answers and view admin responses to your feedback.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2 border-b border-[#F0D8DB]">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-semibold transition ${
              activeTab === "history"
                ? "border-[#9E4752] text-[#9E4752]"
                : "border-transparent text-[#8C6268] hover:text-[#9E4752]"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            My Feedback History
            {myFeedback.length > 0 && (
              <span className="rounded-full bg-[#F8E5E8] px-2 py-0.5 text-[11px] font-bold text-[#9E4752]">
                {myFeedback.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rate")}
            className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-semibold transition ${
              activeTab === "rate"
                ? "border-[#9E4752] text-[#9E4752]"
                : "border-transparent text-[#8C6268] hover:text-[#9E4752]"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            Rate an AI Response
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "history" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#5E232B]">
              Your Submitted Ratings
            </h2>
            <button
              type="button"
              onClick={loadMyFeedback}
              disabled={feedbackLoading}
              className="flex items-center gap-1.5 rounded-lg border border-[#E8C8CC] bg-white px-3 py-1.5 text-xs font-semibold text-[#9E4752] transition hover:bg-[#FDF6F6] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${feedbackLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {feedbackLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#E8C8CC] bg-white p-10 text-sm text-[#8C6268]">
              <Loader2 className="h-5 w-5 animate-spin text-[#9E4752]" />
              Loading your feedback history…
            </div>
          ) : feedbackError ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {feedbackError}
            </div>
          ) : myFeedback.length === 0 ? (
            <div className="rounded-2xl border border-[#E8C8CC] bg-white p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F8E5E8] text-[#9E4752]">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-[#5E232B]">No feedback yet</h3>
              <p className="mt-1 text-xs text-[#8C6268]">
                Switch to the "Rate an AI Response" tab to submit your first rating.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("rate")}
                className="mt-4 rounded-xl bg-[#9E4752] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#722F37]"
              >
                Rate Now
              </button>
            </div>
          ) : (
            myFeedback.map((item) => <FeedbackCard key={item.id} item={item} />)
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#E8C8CC] bg-white p-6 shadow-sm">
          <RateResponseSection onRated={() => { loadMyFeedback(); setActiveTab("history"); }} />
        </div>
      )}
    </div>
  );
}