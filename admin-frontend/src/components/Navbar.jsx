import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  Menu,
  CheckCheck,
  X,
  Settings,
  LogOut
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

export default function Navbar({ onOpenMobileSidebar, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

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

  // Close popovers on outside click & Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setMobileSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('isAdminAuth');
      navigate('/login');
    }
  };

  return (
    <header className="h-16 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E8DCD1] px-3.5 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 transition-all duration-200">
      {/* Mobile Search Overlay when active */}
      <AnimatePresence>
        {mobileSearchActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[#FFFFFF] z-50 px-4 flex items-center gap-2 md:hidden border-b border-[#E8DCD1]"
          >
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
              className="p-1.5 rounded-lg text-[#77716B] hover:text-[#25211E] hover:bg-[#FAF7F2] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left: Mobile Drawer Trigger + Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar"
          className="lg:hidden p-2 rounded-[8px] text-[#77716B] hover:text-[#25211E] hover:bg-[#FAF7F2] border border-[#E8DCD1] transition-all duration-150 active:scale-95 shrink-0"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 leading-tight"
          >
            <div className="hidden xs:flex items-center gap-1.5 text-[11px] text-[#77716B]">
              <span className="hidden sm:inline">Infera AI</span>
              <ChevronRight className="w-3 h-3 hidden sm:inline" />
              <span className="font-semibold text-[#96613F] truncate">{currentMeta.title}</span>
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#25211E] tracking-tight truncate">
              {currentMeta.title}
            </h1>
          </motion.div>
        </AnimatePresence>
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
            className="w-full pl-9 pr-3.5 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileSearchActive(true)}
          className="md:hidden p-2 rounded-[8px] bg-[#FAF7F2] text-[#77716B] border border-[#E8DCD1] active:scale-95 transition-all duration-150"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowProfileMenu(false);
            }}
            aria-label="View notifications"
            aria-expanded={showNotifications}
            className={`relative p-2 rounded-[8px] sm:rounded-[10px] border transition-all duration-150 active:scale-95 cursor-pointer ${
              showNotifications
                ? 'bg-[#F3E8DC] border-[#96613F]/30 text-[#4A3023]'
                : 'bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border-[#E8DCD1]'
            }`}
          >
            <Bell className="w-4 h-4 text-[#77716B]" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#96613F] absolute top-1.5 right-1.5 ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top right' }}
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E8DCD1] rounded-[12px] shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E8DCD1] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#25211E]">
                    Notifications ({unreadCount})
                  </span>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#96613F] hover:text-[#4A3023] transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark read
                  </button>
                </div>

                <div className="divide-y divide-[#E8DCD1] max-h-60 overflow-y-auto custom-sidebar-scroll">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 text-xs transition-colors duration-150 ${
                        item.read
                          ? 'bg-[#FFFFFF] hover:bg-[#FAF7F2]/60'
                          : 'bg-[#FAF7F2]/40 hover:bg-[#FAF7F2]/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[#25211E]">{item.title}</p>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#96613F] mt-1.5 shrink-0" />
                        )}
                      </div>
                      <p className="text-[#77716B] mt-0.5 text-[11px] leading-relaxed">{item.detail}</p>
                      <p className="text-[10px] text-[#96613F] mt-1 font-semibold">{item.time}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowNotifications(false);
            }}
            aria-label="Open profile menu"
            aria-expanded={showProfileMenu}
            className={`flex items-center gap-2 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2.5 py-1 rounded-[10px] cursor-pointer border transition-all duration-150 active:scale-[0.98] ${
              showProfileMenu
                ? 'bg-[#FAF7F2] border-[#E8DCD1]'
                : 'border-transparent hover:bg-[#FAF7F2] hover:border-[#E8DCD1]'
            }`}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#96613F] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
              JS
            </div>
            <div className="hidden md:block leading-tight text-left">
              <p className="text-xs font-semibold text-[#25211E]">Jiya Sharma</p>
              <p className="text-[10px] text-[#77716B]">Admin</p>
            </div>
            <ChevronDown
              className={`hidden md:block w-3.5 h-3.5 text-[#77716B] transition-transform duration-200 ${
                showProfileMenu ? 'rotate-180 text-[#4A3023]' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top right' }}
                className="absolute right-0 mt-2 w-52 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E8DCD1] rounded-[12px] shadow-xl z-50 overflow-hidden"
              >
                <div className="px-3.5 py-2.5 bg-[#FAF7F2] border-b border-[#E8DCD1]">
                  <p className="text-xs font-bold text-[#25211E] truncate">Jiya Sharma</p>
                  <p className="text-[11px] text-[#77716B] truncate">Admin</p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-semibold text-[#25211E] hover:bg-[#FAF7F2] hover:text-[#4A3023] transition-colors duration-150 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#96613F]" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-semibold text-[#A83833] hover:bg-[#FDF0EF] transition-colors duration-150 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}