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
  FolderKanban,
  Users,
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

  // Sample notifications list
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
      title: 'OCR Warning: Legacy Scan.pdf',
      detail: 'Page 47 timed out during raster OCR extraction.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 3,
      title: 'New Member Invitation Sent',
      detail: 'ankit.singh@infera.ai invited to Operations.',
      time: 'Yesterday',
      read: true
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentMeta = PAGE_META[location.pathname] || { title: 'Dashboard', subtitle: '' };

  // Sample quick search results
  const sampleDocs = ['HR Policy.pdf', 'IT Guidelines.pdf', 'Employee Handbook.pdf'];
  const matchedDocs = searchQuery.trim()
    ? sampleDocs.filter((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E8DCD1] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile Drawer Trigger + Breadcrumb / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar"
          className="lg:hidden p-2 rounded-lg text-[#77716B] hover:text-[#25211E] hover:bg-[#FAF7F2] border border-[#E8DCD1]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1.5 text-xs text-[#77716B]">
            <span className="hidden sm:inline">Infera AI</span>
            <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
            <span className="font-semibold text-[#96613F]">{currentMeta.title}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-[#25211E] truncate">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative flex-1 max-w-md hidden md:block">
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

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] shadow-lg p-2.5 z-40">
            <p className="text-[10px] font-bold uppercase text-[#77716B] px-2 mb-1.5">
              Matching Documents
            </p>
            {matchedDocs.length > 0 ? (
              matchedDocs.map((doc) => (
                <div
                  key={doc}
                  onMouseDown={() => {
                    navigate('/documents');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF7F2] cursor-pointer text-xs font-medium text-[#25211E]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#96613F]" />
                  <span>{doc}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#77716B] px-2 py-1">No matching records found.</p>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Quick AI Test + Notification Bell + Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Test AI Button */}
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#F3E8DC] hover:bg-[#E8DCD1] text-[#4A3023] text-xs font-semibold border border-[#E8DCD1] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#96613F]" />
          <span>Test Knowledge Base</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] transition-colors"
          >
            <Bell className="w-4 h-4 text-[#77716B]" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#96613F] absolute top-1.5 right-1.5" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E8DCD1] flex items-center justify-between">
                <span className="text-xs font-bold text-[#25211E]">
                  Notifications ({unreadCount} unread)
                </span>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#96613F] hover:text-[#4A3023]"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-[#E8DCD1] max-h-64 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 text-xs ${item.read ? 'bg-[#FFFFFF]' : 'bg-[#FAF7F2]/60'}`}
                  >
                    <p className="font-semibold text-[#25211E]">{item.title}</p>
                    <p className="text-[#77716B] mt-0.5 leading-relaxed">{item.detail}</p>
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
          className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-[10px] hover:bg-[#FAF7F2] cursor-pointer border border-transparent hover:border-[#E8DCD1] transition-colors"
          title="Admin Profile Settings"
        >
          <div className="w-8 h-8 rounded-full bg-[#96613F] text-white text-xs font-bold flex items-center justify-center shrink-0">
            JS
          </div>
          <div className="hidden sm:block leading-tight text-left">
            <p className="text-xs font-semibold text-[#25211E]">Jiya Sharma</p>
            <p className="text-[11px] text-[#77716B]">Workspace Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}