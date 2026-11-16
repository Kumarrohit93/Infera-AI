import { useState } from "react";
import { User, Sparkles, Lock, Bell, Save, ShieldCheck, Database } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("Vibha Arora");
  const [responseStyle, setResponseStyle] = useState("concise");
  const [autoCitations, setAutoCitations] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#722F37]">Workspace Settings</h2>
        <p className="text-sm text-gray-600">Customize your Infera AI member profile and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#D7A781]/40 pb-3">
        {[
          { id: "profile", label: "Profile & Account", icon: User },
          { id: "ai", label: "AI & RAG Preferences", icon: Sparkles },
          { id: "security", label: "Security & Permissions", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[#722F37] text-white shadow-md"
                  : "bg-white/80 text-[#722F37] border border-[#D7A781]/40 hover:bg-[#D7A781]/20"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {savedToast && (
          <div className="rounded-xl bg-green-50 p-3 text-center text-sm font-semibold text-green-700 border border-green-200">
            ✓ Settings updated successfully!
          </div>
        )}

        {activeTab === "profile" && (
          <div className="rounded-2xl border border-[#D7A781]/40 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#722F37] flex items-center gap-2">
              <User className="h-5 w-5" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#722F37] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm text-[#722F37] outline-none focus:border-[#D7A781]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#722F37] mb-1">Assigned Email</label>
                <input
                  type="email"
                  value="member@infera.ai"
                  disabled
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="rounded-2xl border border-[#D7A781]/40 bg-white p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-[#722F37] flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> AI Engine Tuning
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#722F37] mb-2">Response Depth Style</label>
              <div className="flex gap-3">
                {["concise", "comprehensive"].map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setResponseStyle(style)}
                    className={`rounded-xl px-5 py-2 text-xs font-semibold capitalize border transition ${
                      responseStyle === style
                        ? "bg-[#722F37] text-white border-[#722F37]"
                        : "bg-[#F8F4E7] text-[#722F37] border-[#D7A781]"
                    }`}
                  >
                    {style} Mode
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between pt-2 cursor-pointer border-t border-gray-100">
              <div>
                <p className="text-sm font-semibold text-[#722F37]">Highlight Source Citations</p>
                <p className="text-xs text-gray-500">Show exact document page references automatically</p>
              </div>
              <input
                type="checkbox"
                checked={autoCitations}
                onChange={(e) => setAutoCitations(e.target.checked)}
                className="h-4 w-4 accent-[#722F37]"
              />
            </label>
          </div>
        )}

        {activeTab === "security" && (
          <div className="rounded-2xl border border-[#D7A781]/40 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#722F37] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Security & Workspace Permissions
            </h3>
            <div className="rounded-xl bg-[#F8F4E7] p-4 text-xs text-[#722F37] space-y-1 border border-[#D7A781]/40">
              <p className="font-bold">Role: Organization Member</p>
              <p>Your document access is regulated by organization admin policies and folder permission grants.</p>
            </div>
            <label className="flex items-center justify-between cursor-pointer pt-2">
              <div>
                <p className="text-sm font-semibold text-[#722F37]">Email Invitation Alerts</p>
                <p className="text-xs text-gray-500">Get notified when added to new document workspaces</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 accent-[#722F37]"
              />
            </label>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#722F37] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#5B242C] transition"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}