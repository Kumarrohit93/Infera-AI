import { useState } from "react";
import { Search, Bell, ChevronDown, User, Settings, LogOut, Check, X, Menu } from "lucide-react";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const [invitations, setInvitations] = useState([
    { id: 1, org: "Engineering Docs", role: "Member", time: "2h ago" },
    { id: 2, org: "HR Policies Workspace", role: "Viewer", time: "1d ago" },
  ]);

  const handleInviteAction = (id) => {
    setInvitations(invitations.filter((inv) => inv.id !== id));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#D7A781]/40 bg-[#F8F4E7] px-4 md:px-8">
      
      {/* Left: Toggle Button (Hidden when sidebar is open) & Title */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#D7A781]/40 text-[#722F37] hover:bg-[#D7A781]/20 transition shadow-sm"
            title="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-[#722F37]">Member Portal</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-1 items-center max-w-md mx-3 md:mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#722F37]/60" />
          <input
            type="text"
            placeholder="Search documents, chats..."
            className="h-10 w-full rounded-xl border border-[#D7A781]/50 bg-white pl-10 pr-4 text-sm text-[#722F37] outline-none focus:border-[#722F37]"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#D7A781]/40 text-[#722F37] hover:bg-[#D7A781]/20 transition"
          >
            <Bell className="h-5 w-5" />
            {invitations.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#722F37] text-[10px] font-bold text-white">
                {invitations.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#D7A781]/40 bg-white p-4 shadow-xl z-50">
              <h3 className="text-sm font-bold text-[#722F37] border-b border-gray-100 pb-2">
                Workspace Invitations ({invitations.length})
              </h3>
              <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                {invitations.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No pending invitations</p>
                ) : (
                  invitations.map((inv) => (
                    <div key={inv.id} className="rounded-xl bg-[#F8F4E7] p-3 text-xs">
                      <p className="font-semibold text-[#722F37]">{inv.org}</p>
                      <p className="text-gray-600 mt-0.5">Invited as {inv.role} • {inv.time}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleInviteAction(inv.id)}
                          className="flex items-center gap-1 rounded-lg bg-[#722F37] px-3 py-1 text-white hover:bg-[#5B242C]"
                        >
                          <Check className="h-3 w-3" /> Accept
                        </button>
                        <button
                          onClick={() => handleInviteAction(inv.id)}
                          className="flex items-center gap-1 rounded-lg bg-white border border-gray-300 px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <X className="h-3 w-3" /> Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 rounded-xl bg-white border border-[#D7A781]/40 px-3 py-1.5 text-sm font-semibold text-[#722F37] hover:bg-[#D7A781]/20 transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#722F37] text-xs font-bold text-white">
              VA
            </div>
            <span className="hidden sm:inline">Vibha Arora</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#D7A781]/40 bg-white py-2 shadow-xl z-50 text-sm">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-bold text-[#722F37]">Vibha Arora</p>
                <p className="text-xs text-gray-500">member@infera.ai</p>
              </div>
              <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#F8F4E7] hover:text-[#722F37]">
                <User className="h-4 w-4" /> My Profile
              </a>
              <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#F8F4E7] hover:text-[#722F37]">
                <Settings className="h-4 w-4" /> Settings
              </a>
              <button
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}