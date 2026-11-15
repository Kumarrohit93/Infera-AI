import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  UserPlus,
  MessageSquareText,
  ThumbsUp,
  Settings,
  LogOut,
  ChevronLeft,
  Sparkles,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/folders', label: 'Folders', icon: FolderKanban },
  { path: '/add-member', label: 'Add Member', icon: UserPlus },
  { path: '/members', label: 'Team Members', icon: Users },
  { path: '/chat', label: 'AI Chat', icon: MessageSquareText },
  { path: '/feedback', label: 'Feedback', icon: ThumbsUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const SIDEBAR_EASE = [0.22, 1, 0.36, 1];

export default function Sidebar({ collapsed, setCollapsed, onCloseMobile, onLogout }) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.32, ease: SIDEBAR_EASE }}
      className="h-screen sticky top-0 bg-[#FFFFFF] border-r border-[#E8DCD1] flex flex-col justify-between shrink-0 select-none z-20 relative overflow-hidden"
    >
      {/* Top Part: Header + Navigation */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header (Fixed left padding so icon never jumps) */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E8DCD1] shrink-0 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => collapsed && setCollapsed(false)}
              className={`w-10 h-10 rounded-[11px] bg-[#96613F] text-white flex items-center justify-center shrink-0 shadow-sm transition-all duration-200 ${
                collapsed
                  ? 'hover:bg-[#4A3023] hover:scale-105 active:scale-95 cursor-pointer'
                  : 'cursor-default'
              }`}
              title={collapsed ? 'Expand Sidebar' : 'Infera AI'}
              aria-label={collapsed ? 'Expand Sidebar' : 'Infera AI'}
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <motion.div
              initial={false}
              animate={{
                opacity: collapsed ? 0 : 1,
                x: collapsed ? -8 : 0
              }}
              transition={{ duration: 0.22, ease: SIDEBAR_EASE }}
              className={`min-w-0 leading-tight whitespace-nowrap ${
                collapsed ? 'pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-[#25211E]">Infera AI</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#F3E8DC] text-[#96613F] border border-[#E8DCD1]">
                  Admin
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#77716B] truncate">Knowledge Base</p>
            </motion.div>
          </div>

          {onCloseMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#77716B] hover:text-[#25211E] hover:bg-[#FAF7F2] transition-colors cursor-pointer shrink-0"
              title="Close Sidebar"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <motion.button
              type="button"
              initial={false}
              animate={{
                opacity: collapsed ? 0 : 1,
                scale: collapsed ? 0.8 : 1
              }}
              transition={{ duration: 0.2 }}
              onClick={() => setCollapsed(true)}
              className={`hidden lg:flex p-1.5 rounded-lg text-[#77716B] hover:text-[#25211E] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DCD1] transition-colors active:scale-90 cursor-pointer shrink-0 ${
                collapsed ? 'pointer-events-none' : ''
              }`}
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Navigation Links (Scrollbar Hidden, Zero Icon Jump) */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <motion.div
            initial={false}
            animate={{
              height: collapsed ? 0 : 'auto',
              opacity: collapsed ? 0 : 1,
              marginBottom: collapsed ? 0 : 8
            }}
            transition={{ duration: 0.25, ease: SIDEBAR_EASE }}
            className="overflow-hidden"
          >
            <p className="px-[18px] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#77716B] whitespace-nowrap">
              Workspace Console
            </p>
          </motion.div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onCloseMobile && onCloseMobile()}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `relative group flex items-center gap-3 px-[18px] py-2.5 rounded-[10px] text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-[#96613F] font-semibold'
                      : 'text-[#77716B] hover:bg-[#FAF7F2] hover:text-[#25211E]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarPill"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        className="absolute inset-0 rounded-[10px] bg-[#F3E8DC] border border-[#E8DCD1] shadow-2xs"
                      />
                    )}
                    <Icon
                      className={`relative z-10 w-5 h-5 shrink-0 transition-transform duration-200 ${
                        isActive ? 'scale-105' : 'group-hover:translate-x-0.5'
                      }`}
                    />
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: collapsed ? 0 : 1,
                        x: collapsed ? -8 : 0
                      }}
                      transition={{ duration: 0.22, ease: SIDEBAR_EASE }}
                      className={`relative z-10 whitespace-nowrap ${
                        collapsed ? 'pointer-events-none' : ''
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Part: Status + Logout */}
      <div className="p-3 border-t border-[#E8DCD1] bg-[#FAF7F2]/60 shrink-0 overflow-hidden">
        <motion.div
          initial={false}
          animate={{
            height: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            marginBottom: collapsed ? 0 : 8
          }}
          transition={{ duration: 0.28, ease: SIDEBAR_EASE }}
          className="overflow-hidden"
        >
          <div className="px-3 py-2 rounded-[10px] bg-[#FFFFFF] border border-[#E8DCD1] text-xs shadow-2xs whitespace-nowrap">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-[#25211E]">Vector Index</span>
              <span className="text-[#2B6141] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2B6141] animate-pulse"></span>
                Online
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#77716B] mt-0.5">725 chunks indexed</p>
          </div>
        </motion.div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-[18px] py-2 rounded-[10px] text-xs sm:text-sm font-medium text-[#77716B] hover:bg-[#FDF0EF] hover:text-[#A83833] border border-transparent hover:border-[#F3C9C6] transition-colors duration-200 active:scale-[0.98] cursor-pointer overflow-hidden"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <motion.span
            initial={false}
            animate={{
              opacity: collapsed ? 0 : 1,
              x: collapsed ? -8 : 0
            }}
            transition={{ duration: 0.22, ease: SIDEBAR_EASE }}
            className="whitespace-nowrap"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}