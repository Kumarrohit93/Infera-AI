import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  LogOut,
  FileText,
  Folder,
  Users
} from 'lucide-react';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Workspace overview & telemetry' },
  '/documents': { title: 'Documents', subtitle: 'Upload and manage organization documents' },
  '/folders': { title: 'Folders', subtitle: 'Departmental collections & access permissions' },
  '/add-member': { title: 'Add Member', subtitle: 'Manage organization employees and departments' },
  '/members': { title: 'Team Members', subtitle: 'Manage user roles and invitations' },
  '/chat': { title: 'Test AI', subtitle: 'Test citation accuracy & grounded retrieval' },
  '/feedback': { title: 'Feedback', subtitle: 'Monitor ratings and answer quality' },
  '/settings': { title: 'Settings', subtitle: 'Configure organization, models & security' }
};

function getStoredAdminProfile() {
  try {
    const raw = localStorage.getItem('infera_admin_settings_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.profileData?.name) {
        return parsed.profileData;
      }
    }
  } catch {
    // ignore storage errors
  }
  return { name: 'Jiya Sharma', email: 'jiyasharma@infera.ai', role: 'Admin' };
}

export default function Navbar({ onOpenMobileSidebar, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Sync Admin Profile with SettingsPage -> General tab
  const { data: adminProfile } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: () => queryClient.getQueryData(['adminProfile']) ?? getStoredAdminProfile(),
    initialData: () => queryClient.getQueryData(['adminProfile']) ?? getStoredAdminProfile(),
    enabled: false
  });

  const adminName = adminProfile?.name?.trim() || 'Jiya Sharma';
  const adminRole = adminProfile?.role?.trim() || 'Admin';
  const adminInitials =
    adminName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'JS';

  // Subscribe to existing TanStack Query caches without triggering extra fetches
  const { data: documents = [] } = useQuery({
    queryKey: ['documents', 'All'],
    queryFn: () => queryClient.getQueryData(['documents', 'All']) ?? [],
    initialData: () => queryClient.getQueryData(['documents', 'All']) ?? [],
    enabled: false
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: () => queryClient.getQueryData(['folders']) ?? [],
    initialData: () => queryClient.getQueryData(['folders']) ?? [],
    enabled: false
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => queryClient.getQueryData(['members']) ?? [],
    initialData: () => queryClient.getQueryData(['members']) ?? [],
    enabled: false
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => queryClient.getQueryData(['employees']) ?? [],
    initialData: () => queryClient.getQueryData(['employees']) ?? [],
    enabled: false
  });

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

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { documents: [], folders: [], people: [], total: 0 };
    }

    const matchedDocs = documents
      .filter((doc) => {
        const name = (doc.name || doc.title || '').toLowerCase();
        const folder = (doc.folder || doc.department || '').toLowerCase();
        return name.includes(q) || folder.includes(q);
      })
      .slice(0, 4);

    const matchedFolders = folders
      .filter((folder) => {
        const name = (folder.name || '').toLowerCase();
        const dept = (folder.department || '').toLowerCase();
        return name.includes(q) || dept.includes(q);
      })
      .slice(0, 4);

    const matchedMembers = members.map((m) => ({ ...m, _source: 'member' }));
    const matchedEmployees = employees.map((emp) => ({ ...emp, _source: 'employee' }));
    const matchedPeople = [...matchedMembers, ...matchedEmployees]
      .filter((person) => {
        const name = (person.name || person.fullName || '').toLowerCase();
        const email = (person.email || '').toLowerCase();
        const dept = (person.department || '').toLowerCase();
        const empId = (person.employeeId || '').toLowerCase();
        return name.includes(q) || email.includes(q) || dept.includes(q) || empId.includes(q);
      })
      .slice(0, 4);

    return {
      documents: matchedDocs,
      folders: matchedFolders,
      people: matchedPeople,
      total: matchedDocs.length + matchedFolders.length + matchedPeople.length
    };
  }, [searchQuery, documents, folders, members, employees]);

  const handleSelectSearchResult = (path) => {
    setShowSearchDropdown(false);
    setMobileSearchActive(false);
    setSearchQuery('');
    navigate(path);
  };

  // Close popovers on outside click & Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearchDropdown(false);
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
    localStorage.removeItem('accessToken');
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('isAdminAuth');
      navigate('/login');
    }
  };

  const renderSearchDropdown = () => {
    if (!searchQuery.trim()) return null;

    return (
      <div className="max-h-80 overflow-y-auto custom-sidebar-scroll divide-y divide-[#E8DCD1]">
        {searchResults.total === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs font-semibold text-[#25211E]">No matches found</p>
            <p className="text-[11px] text-[#77716B] mt-0.5">
              Try searching another document, folder, or member name.
            </p>
          </div>
        ) : (
          <>
            {searchResults.documents.length > 0 && (
              <div className="p-2">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                  Documents
                </p>
                {searchResults.documents.map((doc, idx) => (
                  <button
                    key={doc.id || doc._id || `doc-${idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult('/documents')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-[8px] bg-[#F3E8DC] text-[#96613F] flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#25211E] truncate">
                        {doc.name || doc.title}
                      </p>
                      {(doc.folder || doc.department) && (
                        <p className="text-[11px] text-[#77716B] truncate">
                          {doc.folder || doc.department}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchResults.folders.length > 0 && (
              <div className="p-2">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                  Folders
                </p>
                {searchResults.folders.map((folder, idx) => (
                  <button
                    key={folder.id || folder._id || `folder-${idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult('/folders')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-[8px] bg-[#F3E8DC] text-[#96613F] flex items-center justify-center shrink-0">
                      <Folder className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#25211E] truncate">
                        {folder.name}
                      </p>
                      {folder.department && (
                        <p className="text-[11px] text-[#77716B] truncate">
                          {folder.department}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchResults.people.length > 0 && (
              <div className="p-2">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                  Members & Employees
                </p>
                {searchResults.people.map((person, idx) => (
                  <button
                    key={person.id || person._id || `person-${idx}`}
                    type="button"
                    onClick={() =>
                      handleSelectSearchResult(
                        person._source === 'employee' ? '/add-member' : '/members'
                      )
                    }
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-[8px] bg-[#F3E8DC] text-[#96613F] flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#25211E] truncate">
                        {person.name || person.fullName}
                      </p>
                      <p className="text-[11px] text-[#77716B] truncate">
                        {[person.department, person.email].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
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
              placeholder="Search documents, folders, or members..."
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

            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-16 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E8DCD1] shadow-xl z-50">
                {renderSearchDropdown()}
              </div>
            )}
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
      <div ref={searchRef} className="relative flex-1 max-w-xs md:max-w-md hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#77716B] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            placeholder="Search documents, folders, or members..."
            className="w-full pl-9 pr-8 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/10 transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 p-1 rounded-md text-[#77716B] hover:text-[#25211E] hover:bg-[#F3E8DC]/60 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSearchDropdown && searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'top center' }}
              className="absolute left-0 right-0 mt-2 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E8DCD1] rounded-[12px] shadow-xl z-50 overflow-hidden"
            >
              {renderSearchDropdown()}
            </motion.div>
          )}
        </AnimatePresence>
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
              {adminInitials}
            </div>
            <div className="hidden md:block leading-tight text-left">
              <p className="text-xs font-semibold text-[#25211E]">{adminName}</p>
              <p className="text-[10px] text-[#77716B]">{adminRole}</p>
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
                  <p className="text-xs font-bold text-[#25211E] truncate">{adminName}</p>
                  <p className="text-[11px] text-[#77716B] truncate">{adminRole}</p>
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