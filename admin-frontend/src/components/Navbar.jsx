import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  Menu,
  CheckCheck,
  FileText,
  X
} from 'lucide-react';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Workspace overview & telemetry' },
  '/documents': { title: 'Documents', subtitle: 'Upload and manage organization documents' },
  '/folders': { title: 'Folders', subtitle: 'Departmental collections & access permissions' },
  '/members': { title: 'Team Members', subtitle: 'Manage user roles and invitations' },
  '/chat': { title: 'AI Chat', subtitle: 'Test citation accuracy & grounded retrieval' },
  '/feedback': { title: 'Feedback', subtitle: 'Monitor ratings and answer quality' },
  '/settings': { title: 'Settings', subtitle: 'Configure organization, models & security' }
};

export default function Navbar({ onOpenMobileSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'HR Policy.pdf Indexed',
      detail: '142 semantic chunks embedded with zero errors.',
      time: '18 mins ago',
      read: false
    },
    {
      id: 2,
      title: 'OCR Warning: Scan.pdf',
      detail: 'Page 47 timed out during raster OCR extraction.',
      time: '2 hours ago',
      read: false
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentMeta = PAGE_META[location.pathname] || { title: 'Dashboard', subtitle: '' };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E8DCD1] px-3.5 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
      {/* Mobile Search Overlay when active */}
      {mobileSearchActive && (
        <div className="absolute inset-0 bg-[#FFFFFF] z-50 px-4 flex items-center gap-2 md:hidden">
          <Search className="w-4 h-4 text-[#77716B] shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, folders..."
            className="flex-1 py-2 text-xs bg-transparent focus:outline-none text-[#25211E]"
          />
          <button
            type="button"
            onClick={() => {
              setMobileSearchActive(false);
              setSearchQuery('');
            }}
            className="p-1 rounded-lg text-[#77716B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Left: Mobile Drawer Trigger + Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar"
          className="lg:hidden p-2 rounded-[8px] text-[#77716B] hover:text-[#25211E] hover:bg-[#FAF7F2] border border-[#E8DCD1] shrink-0"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="min-w-0 leading-tight">
          <div className="hidden xs:flex items-center gap-1.5 text-[11px] text-[#77716B]">
            <span className="hidden sm:inline">Infera AI</span>
            <ChevronRight className="w-3 h-3 hidden sm:inline" />
            <span className="font-semibold text-[#96613F] truncate">{currentMeta.title}</span>
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#25211E] truncate">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Center: Desktop Global Search Bar */}
      <div className="relative flex-1 max-w-xs md:max-w-md hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#77716B] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, folders, or members..."
            className="w-full pl-9 pr-14 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-all"
          />
          <span className="absolute right-2.5 text-[10px] font-bold text-[#77716B] bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E8DCD1]">
            Ctrl+K
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileSearchActive(true)}
          className="md:hidden p-2 rounded-[8px] bg-[#FAF7F2] text-[#77716B] border border-[#E8DCD1]"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Test AI Button (Hidden on small phones, visible on sm+) */}
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#F3E8DC] hover:bg-[#E8DCD1] text-[#4A3023] text-xs font-semibold border border-[#E8DCD1] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#96613F]" />
          <span>Test AI</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 rounded-[8px] sm:rounded-[10px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] transition-colors"
          >
            <Bell className="w-4 h-4 text-[#77716B]" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#96613F] absolute top-1.5 right-1.5" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E8DCD1] flex items-center justify-between">
                <span className="text-xs font-bold text-[#25211E]">
                  Notifications ({unreadCount})
                </span>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#96613F]"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
              </div>

              <div className="divide-y divide-[#E8DCD1] max-h-60 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="px-4 py-3 text-xs bg-[#FFFFFF]">
                    <p className="font-semibold text-[#25211E]">{item.title}</p>
                    <p className="text-[#77716B] mt-0.5 text-[11px]">{item.detail}</p>
                    <p className="text-[10px] text-[#96613F] mt-1 font-semibold">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2 py-1 rounded-[10px] hover:bg-[#FAF7F2] cursor-pointer border border-transparent hover:border-[#E8DCD1] transition-colors"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#96613F] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">
            JS
          </div>
          <div className="hidden md:block leading-tight text-left">
            <p className="text-xs font-semibold text-[#25211E]">Jiya Sharma</p>
            <p className="text-[10px] text-[#77716B]">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}