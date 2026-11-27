import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { UserCog, Save, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SETTINGS_STORAGE_KEY = 'infera_admin_settings_v1';

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const TABS = [
  { id: 'general', label: 'General', icon: UserCog }
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  const { data: account } = useQuery({
    queryKey: ['current-user'],
    queryFn: authApi.getCurrentUser,
    retry: false,
  });

  const [savedInitial] = useState(() => loadSavedSettings());

  // General / Admin Profile State
  const [profileData, setProfileData] = useState(() => ({
    name: savedInitial?.profileData?.name || '',
    email: savedInitial?.profileData?.email || '',
    role: savedInitial?.profileData?.role || '',
    currentPassword: '',
    newPassword: ''
  }));

  const persistSettings = (overrides = {}) => {
    try {
      const nextProfile = {
        name: (overrides.profileData ?? profileData).name,
        email: (overrides.profileData ?? profileData).email,
        role: (overrides.profileData ?? profileData).role
      };
      const payload = {
        ...(savedInitial || {}),
        profileData: nextProfile
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      queryClient.setQueryData(['adminProfile'], nextProfile);
    } catch {
      // Ignore storage quota errors
    }
  };

  const handleSave = () => {
    persistSettings();
    toast.error('Settings changes are not saved: the backend does not expose a settings endpoint yet.');
  };

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_AUTH_URL || 'https://infera-ai.onrender.com/api'}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch((error) => console.error('Could not revoke the server session:', error));
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAdminAuth');
    localStorage.removeItem('infera_admin_query_cache_v1');
    localStorage.removeItem('infera_admin_settings_v1');
    queryClient.clear();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] tracking-tight">
          Workspace Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#77716B] mt-1">
          Manage your administrator profile and account security.
        </p>
        <p className="mt-3 rounded-lg border border-[#E8DCD1] bg-white px-3 py-2 text-xs text-[#77716B]">
          Organization profile details are loaded from the auth backend. Settings, password changes, and external integrations are not writable because these backend endpoints are not implemented yet.
        </p>
      </div>

      {/* 2. Main 2-Column Vertical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Vertical Navigation Menu */}
        <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-2 sm:p-2.5 shadow-sm space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-xs sm:text-sm font-semibold transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1] shadow-2xs'
                    : 'text-[#77716B] hover:bg-[#FAF7F2] hover:text-[#25211E]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#96613F]' : ''}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Panel (3 Cols) */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-8"
            >
              {/* Section 1: Admin Profile */}
              <div>
                <h3 className="text-base font-bold text-[#25211E] tracking-tight">Admin Profile & Security</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Update your administrator profile details, change password, or sign out.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Admin Full Name</label>
                    <input
                      type="text"
                      value={profileData.name || account?.user?.name || ''}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Admin Email</label>
                    <input
                      type="email"
                      value={profileData.email || account?.user?.email || ''}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Role Title</label>
                    <input
                      type="text"
                      disabled
                      value={profileData.role || (account?.role === 'admin' ? 'Workspace Admin' : account?.role || '')}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8DCD1] rounded-[10px] text-[#77716B] font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-all duration-150 active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Profile</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Change Password */}
              <div className="pt-6 border-t border-[#F3E8DC]">
                <h4 className="text-sm font-bold text-[#25211E] tracking-tight">Change Administrator Password</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!profileData.currentPassword || !profileData.newPassword) {
                        toast.error('Please enter both current and new passwords.');
                        return;
                      }
                      handleSave();
                    }}
                    className="px-4 py-2 rounded-[8px] bg-white hover:bg-[#FAF7F2] border border-[#E8DCD1] hover:border-[#96613F] text-xs font-semibold text-[#25211E] transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Section 3: End Session / Logout */}
              <div className="pt-6 border-t border-[#F3E8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#25211E] tracking-tight">End Administrator Session</h4>
                  <p className="text-xs text-[#77716B] mt-0.5">
                    Revoke current browser authentication and return to the login screen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FDF0EF] hover:bg-[#A83833] text-[#A83833] hover:text-white border border-[#F3C9C6] text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs shrink-0 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout of Admin Panel</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}