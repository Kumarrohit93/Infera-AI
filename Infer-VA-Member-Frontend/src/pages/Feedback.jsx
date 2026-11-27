import { useState } from "react";
import { MessageSquarePlus, Send, CheckCircle2 } from "lucide-react";

export default function Feedback() {
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Yahan aap baad mein apni backend feedback API call add kar sakti hain
    setSubmitted(true);
    setMessage("");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-3xl border border-[#E8C8CC] bg-white p-8 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E5E8] text-[#9E4752]">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#5E232B]">Share Feedback</h1>
            <p className="text-sm text-[#8C6268]">
              Help us improve your Infera AI workspace experience.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <h2 className="mt-3 text-lg font-bold text-emerald-900">
              Thank you for your feedback!
            </h2>
            <p className="mt-1 text-sm text-emerald-700">
              Your response has been recorded.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-4 rounded-xl bg-[#9E4752] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#722F37]"
            >
              Submit Another Feedback
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#5E232B]">
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E2B8BE] bg-[#FDF6F6] px-4 text-sm text-[#5E232B] outline-none focus:border-[#9E4752]"
              >
                <option value="general">General Experience</option>
                <option value="ai-chat">AI Chat Accuracy</option>
                <option value="documents">Document Explorer</option>
                <option value="bug">Report a Bug</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#5E232B]">
                Your Message
              </label>
              <textarea
                rows={5}
                required
                placeholder="Write your suggestions, issues, or thoughts here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-[#E2B8BE] bg-[#FDF6F6] p-4 text-sm text-[#5E232B] placeholder-[#A47A80] outline-none focus:border-[#9E4752]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#9E4752] px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#722F37]"
            >
              <Send className="h-4 w-4" />
              Send Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}