import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  MessageSquareText,
  ThumbsUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/folders', label: 'Folders', icon: FolderKanban },
  { path: '/members', label: 'Team Members', icon: Users },
  { path: '/chat', label: 'AI Chat', icon: MessageSquareText },
  { path: '/feedback', label: 'Feedback', icon: ThumbsUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed, onCloseMobile, onLogout }) {
  // Draggable Width State (Default 256px, Threshold to collapse is < 140px)
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  // Mouse drag logic for resizing sidebar
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizingRef.current) return;
    const newWidth = e.clientX;

    // DRAG-TO-COLLAPSE: Agar left drag karte karte 140px se chhota ho jaye toh auto-collapse kar do
    if (newWidth < 140) {
      setCollapsed(true);
      return;
    }

    // Agar 140px se bada drag kare toh auto-expand kar do
    if (newWidth >= 140 && newWidth <= 450) {
      if (collapsed) {
        setCollapsed(false);
      }
      setSidebarWidth(newWidth);
    }
  }, [collapsed, setCollapsed]);

  const handleMouseUp = useCallback(() => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <aside
      style={{ width: collapsed ? 80 : sidebarWidth }}
      className={`h-screen sticky top-0 bg-[#FFFFFF] border-r border-[#E8DCD1] flex flex-col justify-between shrink-0 select-none z-20 relative ${
        isResizing ? 'transition-none' : 'transition-[width] duration-200'
      }`}
    >
      {/* ================= DRAGGABLE RESIZER HANDLE (RIGHT BORDER) ================= */}
      {/* Yeh border expanded aur collapsed dono state mein drag ho sakti hai */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={() => {
          if (collapsed) {
            setCollapsed(false);
            setSidebarWidth(256);
          } else {
            setCollapsed(true);
          }
        }}
        title={collapsed ? "Drag right to expand" : "Drag left to close • Double click to collapse"}
        className={`absolute top-0 right-0 w-2.5 h-full cursor-col-resize z-30 group flex items-center justify-center transition-colors ${
          isResizing ? 'bg-[#96613F]/30' : 'hover:bg-[#96613F]/20'
        }`}
      >
        <div className="w-[2px] h-8 rounded-full bg-[#E8DCD1] group-hover:bg-[#96613F] transition-colors" />
      </div>

      {/* Top Part: Header + Navigation */}
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-[#E8DCD1] shrink-0 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={() => {
                setCollapsed(false);
                setSidebarWidth(256);
              }}
              className="w-10 h-10 rounded-[12px] bg-[#96613F] text-white flex items-center justify-center shadow-xs hover:bg-[#4A3023] transition-colors cursor-pointer"
              title="Click to Expand Sidebar"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-[#96613F] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm sm:text-base text-[#25211E]">Infera AI</span>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#F3E8DC] text-[#96613F] border border-[#E8DCD1]">
                      Admin
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#77716B] truncate">Knowledge Base</p>
                </div>
              </div>

              {onCloseMobile ? (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="lg:hidden p-1.5 rounded-lg text-[#77716B] hover:text-[#25211E] hover:bg-[#FAF7F2] transition-colors"
                  title="Close Sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="hidden lg:flex p-1.5 rounded-lg text-[#77716B] hover:text-[#25211E] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DCD1] transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Navigation Links with Sleek Custom Scrollbar */}
        <div className="py-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)] custom-sidebar-scroll">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#77716B]">
              Workspace Console
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onCloseMobile && onCloseMobile()}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs sm:text-sm font-medium transition-all ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-[#F3E8DC] text-[#96613F] font-semibold border border-[#E8DCD1]'
                      : 'text-[#77716B] hover:bg-[#FAF7F2] hover:text-[#25211E] border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Part: Status + Logout */}
      <div className="p-3 border-t border-[#E8DCD1] bg-[#FAF7F2]/60 space-y-2 shrink-0">
        {!collapsed && (
          <div className="px-3 py-2 rounded-[10px] bg-[#FFFFFF] border border-[#E8DCD1] text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-[#25211E]">Vector Index</span>
              <span className="text-[#2B6141] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2B6141]"></span>
                Online
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#77716B] mt-0.5">725 chunks indexed</p>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs sm:text-sm font-medium text-[#77716B] hover:bg-[#FDF0EF] hover:text-[#A83833] border border-transparent hover:border-[#F3C9C6] transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}