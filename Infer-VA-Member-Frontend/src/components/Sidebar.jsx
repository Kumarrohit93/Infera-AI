import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Document Explorer", path: "/documents", icon: "📁" },
    { name: "AI Chat", path: "/chat", icon: "🤖" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="flex h-dvh w-64 flex-col justify-between border-r border-[#D7A781]/30 bg-[#722F37] text-white shadow-2xl lg:shadow-none">
      <div>
        {/* Brand Header with Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
              <img
                src="/infera-logo.jpeg"
                alt="Infera AI Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">
                Infera <span className="text-[#D7A781]">AI</span>
              </h1>
              <p className="text-[10px] text-white/60">Knowledge Workspace</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white lg:hidden text-lg font-bold p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 px-4 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#D7A781] text-[#722F37] shadow-md font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Logout Button */}
      <div className="p-4 mx-4 mb-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600/80 hover:text-white border border-white/10 shadow-sm"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}