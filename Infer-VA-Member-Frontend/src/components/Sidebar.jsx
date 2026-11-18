import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, MessageSquare, History, Settings, LogOut } from "lucide-react";

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Document Explorer", path: "/documents", icon: FolderKanban },
    { name: "AI Chat", path: "/chat", icon: MessageSquare },
    { name: "Chat History", path: "/history", icon: History },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="flex h-dvh w-64 flex-col justify-between border-r border-[#D7A781]/30 bg-[#722F37] text-white shadow-2xl">
      <div>
        {/* Brand Header with Logo Button to Toggle/Close */}
        <div className="flex h-20 items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md hover:bg-[#F8F4E7] transition cursor-pointer"
              title="Close Sidebar"
            >
              <img
                src="/infera-logo.jpeg"
                alt="Infera AI Logo"
                className="h-full w-full object-contain rounded-lg"
              />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-wide">
                Infera <span className="text-[#D7A781]">AI</span>
              </h1>
              <p className="text-[10px] text-white/60">Knowledge Workspace</p>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-base font-bold p-1 rounded-lg hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links with onClick={onClose} added */}
        <nav className="space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose} // <-- Yeh line ensure karegi ki link click hote hi sidebar close ho jaye
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#D7A781] text-[#722F37] shadow-md font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <IconComponent className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Logout Button */}
      <div className="p-4 mx-4 mb-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600/80 hover:text-white border border-white/10 shadow-sm"
        >
          <LogOut className="h-4 w-4" /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}