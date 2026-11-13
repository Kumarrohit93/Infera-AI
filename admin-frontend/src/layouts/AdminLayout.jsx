import React, { useState } from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // STRICT AUTH CHECK: Agar admin login nahi hai toh layout bilkul render na ho, seedha /login bhejo
  const isAuth = localStorage.getItem('isAdminAuth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#FAF7F2] text-[#25211E] flex">
      {/* 1. Desktop Sidebar (Always Full Height from Top to Bottom) */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onLogout={handleLogout}
        />
      </div>

      {/* 2. Mobile / Tablet Drawer (GPU-composited 60fps slide) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            key="mobile-drawer-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-0 z-50 lg:hidden flex"
          >
            <div
              className="fixed inset-0 bg-[#25211E]/45"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-64 max-w-[85vw] h-full shadow-2xl will-change-transform"
            >
              <Sidebar
                collapsed={false}
                setCollapsed={() => setMobileSidebarOpen(false)}
                onCloseMobile={() => setMobileSidebarOpen(false)}
                onLogout={() => {
                  setMobileSidebarOpen(false);
                  handleLogout();
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Right Area (Navbar Fixed at Top, Only Content Area Scrolls) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Fixed Navbar */}
        <div className="shrink-0 z-10">
          <Navbar
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            onLogout={handleLogout}
          />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto custom-sidebar-scroll p-3.5 sm:p-5 md:p-6 lg:p-7">
          <div className="max-w-[1440px] w-full mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}