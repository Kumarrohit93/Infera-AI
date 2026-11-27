import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { getStoredUser, getUserInitials, logout } from "../services/authService";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef(null);

  const member = getStoredUser() || {};
  const memberName = member.name || "Member";
  const memberEmail = member.email || "";

  useEffect(() => {
    if (!showProfile) return;

    const handleOutsideClick = (event) => {
      const clickedInsideProfile =
        profileRef.current && profileRef.current.contains(event.target);

      if (!clickedInsideProfile) {
        setShowProfile(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showProfile]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E8C8CC] bg-[#FDF6F6] px-4 md:px-8">
      {/* Left: Logo Button (Visible only when sidebar is closed) & Title */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[#E2B8BE] bg-white p-1.5 shadow-xs transition hover:bg-[#F8E8EA]"
            title="Open Sidebar"
          >
            <img
              src="/infera-logo.jpeg"
              alt="Infera AI Logo"
              className="h-full w-full rounded-lg object-contain"
            />
          </button>
        )}

        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-[#6E2D36]">Member Portal</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mx-3 flex max-w-md flex-1 items-center md:mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E4752]/70" />
          <input
            type="text"
            placeholder="Search documents, chats..."
            className="h-10 w-full rounded-xl border border-[#E2B8BE] bg-white pl-10 pr-4 text-sm text-[#5E232B] placeholder-[#A47A80] outline-none transition focus:border-[#9E4752] focus:ring-2 focus:ring-[#9E4752]/15"
          />
        </div>
      </div>

      {/* Right: Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfile((prev) => !prev);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#E2B8BE] bg-white px-3 py-1.5 text-sm font-semibold text-[#6E2D36] transition hover:bg-[#F8E8EA]"
            aria-expanded={showProfile}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9E4752] text-xs font-bold text-white">
              {getUserInitials(memberName)}
            </div>
            <span className="hidden sm:inline">{memberName}</span>
            <ChevronDown className="h-4 w-4 text-[#8C6268]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-[#E8C8CC] bg-white py-2 text-sm shadow-xl">
              <div className="border-b border-[#F2DCE0] px-4 py-2">
                <p className="font-bold text-[#6E2D36]">{memberName}</p>
                <p className="truncate text-xs text-[#8C6268]">{memberEmail}</p>
              </div>
              <a
                href="/profile"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-4 py-2 text-[#5E232B] transition hover:bg-[#FDF6F6] hover:text-[#9E4752]"
              >
                <User className="h-4 w-4 text-[#9E4752]" /> My Profile
              </a>
              <a
                href="/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-4 py-2 text-[#5E232B] transition hover:bg-[#FDF6F6] hover:text-[#9E4752]"
              >
                <Settings className="h-4 w-4 text-[#9E4752]" /> Settings
              </a>
              <button
                type="button"
                onClick={async () => {
                  setShowProfile(false);
                  try {
                    await logout();
                  } catch (error) {
                    console.error("Could not revoke the server session:", error);
                  } finally {
                    window.location.href = "/";
                  }
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-rose-600 transition hover:bg-rose-50"
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