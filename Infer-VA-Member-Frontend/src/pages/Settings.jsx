import { useState } from "react";
import { User, Save } from "lucide-react";
import { getStoredUser } from "../services/authService";

export default function Settings() {
  const member = getStoredUser() || {};
  const [name, setName] = useState(member.name || "");
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#5E232B]">Workspace Settings</h2>
        <p className="text-sm text-[#8C6268]">Customize your Infera AI member profile</p>
      </div>

      {/* Single Tab: Profile & Account */}
      <div className="flex gap-2 border-b border-[#E8C8CC] pb-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-[#9E4752] px-4 py-2 text-sm font-semibold text-white shadow-2xs"
        >
          <User className="h-4 w-4" /> Profile & Account
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {savedToast && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700">
            ✓ Settings updated successfully!
          </div>
        )}

        <div className="space-y-4 rounded-2xl border border-[#E8C8CC] bg-white p-6 shadow-2xs">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#5E232B]">
            <User className="h-5 w-5 text-[#9E4752]" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6E2D36]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E2B8BE] bg-white px-3 text-sm text-[#5E232B] outline-none transition focus:border-[#9E4752] focus:ring-2 focus:ring-[#9E4752]/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6E2D36]">
                Assigned Email
              </label>
              <input
                type="email"
                value={member.email || ""}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-xl border border-[#F2DCE0] bg-[#FDF6F6] px-3 text-sm text-[#8C6268]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#9E4752] px-6 py-3 text-sm font-semibold text-white shadow-2xs transition hover:bg-[#853842]"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}