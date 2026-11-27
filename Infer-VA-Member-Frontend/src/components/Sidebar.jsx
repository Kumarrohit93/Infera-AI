import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  MessageSquarePlus,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "../services/authService";

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Document Explorer", path: "/documents", icon: FolderKanban },
    { name: "AI Chat", path: "/chat", icon: MessageSquare },
    { name: "Feedback", path: "/feedback", icon: MessageSquarePlus },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Could not revoke the server session:", error);
    } finally {
      navigate("/");
    }
  };

  // Function to handle link clicks based on screen size
  const handleNavClick = () => {
    // Agar screen mobile/tablet ki hai (< 1024px), tabhi sidebar close hoga
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <aside className="flex h-dvh w-64 flex-col justify-between border-r border-[#E8C8CC] bg-[#FDF6F6] text-[#5E232B] shadow-sm">
      <div>
        {/* Brand Header with Logo Button & Close Cross (Always closes on click) */}
        <div className="flex h-20 items-center justify-between border-b border-[#E8C8CC] px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E2B8BE] bg-white p-1.5 shadow-xs transition hover:bg-[#F8E8EA]"
              title="Close Sidebar"
            >
              <img
                src="/infera-logo.jpeg"
                alt="Infera AI Logo"
                className="h-full w-full rounded-lg object-contain"
              />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-[#5E232B]">
                Infera <span className="text-[#9E4752]">AI</span>
              </h1>
              <p className="text-[10px] text-[#8C6268]">Knowledge Workspace</p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-base font-bold text-[#8C6268] transition hover:bg-[#F8E8EA] hover:text-[#5E232B]"
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "border border-[#E3B8BE] bg-[#F3DADF] font-semibold text-[#5A232B] shadow-2xs"
                      : "text-[#6E3B43] hover:bg-[#F8E8EA] hover:text-[#5A232B]"
                  }`
                }
              >
                <IconComponent className="h-5 w-5 shrink-0 text-[#9E4752]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Logout Button */}
      <div className="mx-4 mb-4 p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2B8BE] bg-white px-4 py-3 text-sm font-semibold text-[#6E2D36] shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="h-4 w-4 text-[#9E4752]" /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}