import { useState } from "react";
import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { getStoredUser, getUserInitials, logout } from "../services/authService";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const member = getStoredUser() || {};
  const memberName = member.name || "Member";
  const memberEmail = member.email || "";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#D7A781]/40 bg-[#F8F4E7] px-4 md:px-8">
      
      {/* Left: Logo Button (Visible only when sidebar is closed) & Title */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#D7A781]/40 p-1.5 shadow-sm hover:bg-[#F8F4E7] transition cursor-pointer"
            title="Open Sidebar"
          >
            <img
              src="/infera-logo.jpeg"
              alt="Infera AI Logo"
              className="h-full w-full object-contain rounded-lg"
            />
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
        
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#D7A781]/40 text-[#722F37] hover:bg-[#D7A781]/20 transition"
          >
            <Bell className="h-5 w-5" />
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#D7A781]/40 bg-white p-4 shadow-xl z-50">
              <h3 className="border-b border-gray-100 pb-2 text-sm font-bold text-[#722F37]">
                Notifications
              </h3>
              <p className="py-4 text-center text-xs text-gray-500">
                No new notifications
              </p>
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
              {getUserInitials(memberName)}
            </div>
            <span className="hidden sm:inline">{memberName}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#D7A781]/40 bg-white py-2 shadow-xl z-50 text-sm">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-bold text-[#722F37]">{memberName}</p>
                <p className="text-xs text-gray-500">{memberEmail}</p>
              </div>
              <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#F8F4E7] hover:text-[#722F37]">
                <User className="h-4 w-4" /> My Profile
              </a>
              <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#F8F4E7] hover:text-[#722F37]">
                <Settings className="h-4 w-4" /> Settings
              </a>
              <button
                onClick={async () => {
                  try {
                    await logout();
                  } catch (error) {
                    console.error("Could not revoke the server session:", error);
                  } finally {
                    window.location.href = "/";
                  }
                }}
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