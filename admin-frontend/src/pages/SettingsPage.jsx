import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Cpu,
  ShieldCheck,
  Boxes,
  UserCog,
  Upload,
  Save,
  Check,
  CheckCircle2,
  LogOut,
  Sliders,
  Sparkles,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'ai-model', label: 'AI & Model', icon: Cpu },
  { id: 'access', label: 'Access & Permissions', icon: ShieldCheck },
  { id: 'integrations', label: 'Integrations', icon: Boxes },
  { id: 'general', label: 'General', icon: UserCog }
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('organization');

  // Tab 1: Organization State
  const [orgData, setOrgData] = useState({
    name: 'Infera Enterprise Solutions Pvt. Ltd.',
    domain: 'infera.ai'
  });

  // Tab 2: AI & Model State
  const [aiData, setAiData] = useState({
    provider: 'OpenAI Enterprise',
    model: 'gpt-4o (128k Context)',
    temperature: 0.2,
    topK: 4,
    chunkSize: 800,
    embeddingModel: 'text-embedding-3-large',
    strictGrounding: true
  });

  // Tab 3: Access & Permissions State
  const [permissions, setPermissions] = useState({
    viewExcerpts: true,
    allowDownloads: true,
    autoAssignGeneral: true,
    enforce2FA: true,
    defaultFolderAccess: 'Restricted (Explicit Member Selection)'
  });

  // Tab 4: Integrations State
  const [integrations, setIntegrations] = useState([
    {
      id: 'gdrive',
      name: 'Google Drive Workspace',
      status: 'Connected',
      description: 'Auto-sync approved PDF and DOCX files from shared departmental drives.',
      actionText: 'Disconnect',
      actionStyle: 'border-[#E8DCD1] text-[#77716B] hover:text-[#A83833] hover:border-[#F3C9C6]'
    },
    {
      id: 'slack',
      name: 'Slack Knowledge Bot',
      status: 'Connected',
      description: 'Allow team members to query @InferaAI directly inside Slack channels.',
      actionText: 'Configure',
      actionStyle: 'border-[#E8DCD1] text-[#77716B] hover:text-[#96613F] hover:border-[#96613F]'
    },
    {
      id: 'notion',
      name: 'Notion Internal Wiki',
      status: 'Available',
      description: 'Ingest engineering handbooks and operational SOP pages automatically.',
      actionText: 'Connect',
      actionStyle: 'bg-[#96613F] text-white hover:bg-[#4A3023]'
    },
    {
      id: 'sharepoint',
      name: 'Microsoft SharePoint',
      status: 'Available',
      description: 'Enterprise connector for legal and compliance document libraries.',
      actionText: 'Connect',
      actionStyle: 'bg-[#96613F] text-white hover:bg-[#4A3023]'
    }
  ]);

  // Tab 5: General / Admin Profile State
  const [profileData, setProfileData] = useState({
    name: 'Jiya Sharma',
    email: 'jiyasharma@infera.ai',
    role: 'Workspace Admin',
    currentPassword: '',
    newPassword: ''
  });

  // Action Handlers
  const handleSave = (message) => {
    toast.success(message);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
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
          Manage organization branding, AI retrieval hyperparameters, permissions, and account security.
        </p>
      </div>

      {/* 2. Main 2-Column Vertical Layout (Exact Video Structure) */}
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
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-xs sm:text-sm font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1] shadow-xs'
                    : 'text-[#77716B] hover:bg-[#FAF7F2] hover:text-[#25211E]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#96613F]' : ''}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Panel (3 Cols) */}
        <div className="lg:col-span-3">
          {/* TAB 1: ORGANIZATION */}
          {activeTab === 'organization' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-8"
            >
              <div>
                <h3 className="text-base font-bold text-[#25211E]">Organization Profile</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Configure your company identity and verified email domain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-[#25211E] mb-1.5">
                    Organization Legal Name
                  </label>
                  <input
                    type="text"
                    value={orgData.name}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#25211E] mb-1.5">
                    Organization Domain
                  </label>
                  <input
                    type="text"
                    value={orgData.domain}
                    onChange={(e) => setOrgData({ ...orgData, domain: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F]"
                  />
                </div>
              </div>

              {/* Upload Logo Section */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#25211E] mb-2">
                  Upload Organization Logo
                </label>
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-[#96613F] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#25211E]">
                        Current Brand Asset: <span className="font-semibold text-[#96613F]">infera-brand-mark.svg</span>
                      </p>
                      <p className="text-[11px] text-[#77716B]">
                        Recommended 512x512 PNG or SVG (max 2MB)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success('Logo upload dialog opened.')}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[8px] bg-white border border-[#E8DCD1] hover:border-[#96613F] text-xs font-semibold text-[#25211E] transition-colors shadow-xs shrink-0"
                  >
                    <Upload className="w-4 h-4 text-[#77716B]" />
                    <span>Upload New Logo</span>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-[#F3E8DC] flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave('Organization settings saved.')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Organization Settings</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AI & MODEL */}
          {activeTab === 'ai-model' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-8"
            >
              <div>
                <h3 className="text-base font-bold text-[#25211E]">AI & Model Configuration</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Configure LLM provider, temperature, and vector retrieval parameters.
                </p>
              </div>

              {/* Provider & Model Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-[#25211E] mb-1.5">AI Provider</label>
                  <select
                    value={aiData.provider}
                    onChange={(e) => setAiData({ ...aiData, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F]"
                  >
                    <option value="OpenAI Enterprise">OpenAI Enterprise</option>
                    <option value="Anthropic Enterprise">Anthropic Enterprise</option>
                    <option value="Azure OpenAI">Azure OpenAI Service</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#25211E] mb-1.5">Model Selection</label>
                  <select
                    value={aiData.model}
                    onChange={(e) => setAiData({ ...aiData, model: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F]"
                  >
                    <option value="gpt-4o (128k Context)">gpt-4o (128k Context)</option>
                    <option value="gpt-4o-mini (128k Context)">gpt-4o-mini (128k Context)</option>
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet (200k Context)</option>
                  </select>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-[#25211E]">
                    Model Temperature (Factual Grounding vs. Creativity)
                  </label>
                  <span className="font-bold text-[#96613F] bg-[#FAF7F2] px-2.5 py-0.5 rounded border border-[#E8DCD1]">
                    {aiData.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={aiData.temperature}
                  onChange={(e) => setAiData({ ...aiData, temperature: Number(e.target.value) })}
                  className="w-full accent-[#96613F]"
                />
                <div className="flex justify-between text-[11px] text-[#77716B]">
                  <span>0.0 (Deterministic & Strict Citations)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Creative & Generative)</span>
                </div>
              </div>

              {/* 3 Parameter Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                    Top-K Retrieved Chunks
                  </p>
                  <select
                    value={aiData.topK}
                    onChange={(e) => setAiData({ ...aiData, topK: Number(e.target.value) })}
                    className="mt-2 w-full bg-white border border-[#E8DCD1] rounded-[8px] p-1.5 text-xs font-semibold text-[#25211E] focus:outline-none focus:border-[#96613F]"
                  >
                    <option value={3}>Top 3 Chunks</option>
                    <option value={4}>Top 4 Chunks (Recommended)</option>
                    <option value={6}>Top 6 Chunks</option>
                    <option value={8}>Top 8 Chunks</option>
                  </select>
                </div>

                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                    Chunk Size (Tokens)
                  </p>
                  <select
                    value={aiData.chunkSize}
                    onChange={(e) => setAiData({ ...aiData, chunkSize: Number(e.target.value) })}
                    className="mt-2 w-full bg-white border border-[#E8DCD1] rounded-[8px] p-1.5 text-xs font-semibold text-[#25211E] focus:outline-none focus:border-[#96613F]"
                  >
                    <option value={500}>500 Tokens</option>
                    <option value={800}>800 Tokens (Default)</option>
                    <option value={1000}>1000 Tokens</option>
                  </select>
                </div>

                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                    Embedding Model
                  </p>
                  <p className="text-xs font-bold text-[#25211E] mt-2">
                    text-embedding-3-large
                  </p>
                  <p className="text-[11px] text-[#77716B] mt-0.5">3,072 dimensions • Active</p>
                </div>
              </div>

              {/* Strict Source Citations Toggle */}
              <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[#25211E]">Enforce Strict Source Citations</p>
                  <p className="text-[11px] text-[#77716B] mt-0.5">
                    Prevent the AI assistant from answering questions when no matching document chunk exceeds 0.70 similarity.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiData.strictGrounding}
                  onChange={(e) => setAiData({ ...aiData, strictGrounding: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-[#F3E8DC] flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave('AI & Model parameters saved.')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save AI Configuration</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ACCESS & PERMISSIONS */}
          {activeTab === 'access' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-[#25211E]">Access & Permissions</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Define default member capabilities and folder visibility policies.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* 1 */}
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#25211E]">Allow Members to View Cited Source Excerpts</p>
                    <p className="text-[11px] text-[#77716B] mt-0.5">
                      Users can open the Source Reference Card modal to verify page numbers and text excerpts.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.viewExcerpts}
                    onChange={(e) => setPermissions({ ...permissions, viewExcerpts: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                  />
                </div>

                {/* 2 */}
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#25211E]">Allow Original PDF / DOCX File Downloads</p>
                    <p className="text-[11px] text-[#77716B] mt-0.5">
                      Permit members to download original files from folders they are assigned to.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.allowDownloads}
                    onChange={(e) => setPermissions({ ...permissions, allowDownloads: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                  />
                </div>

                {/* 3 */}
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#25211E]">Auto-Assign "General" Folder to New Invitations</p>
                    <p className="text-[11px] text-[#77716B] mt-0.5">
                      Automatically grant new team members access to company-wide announcements and rules.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.autoAssignGeneral}
                    onChange={(e) => setPermissions({ ...permissions, autoAssignGeneral: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                  />
                </div>

                {/* 4 */}
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#25211E]">Enforce Multi-Factor Authentication (2FA) for Admins</p>
                    <p className="text-[11px] text-[#77716B] mt-0.5">
                      Require hardware key or authenticator app verification for all Admin role accounts.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.enforce2FA}
                    onChange={(e) => setPermissions({ ...permissions, enforce2FA: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                  />
                </div>

                {/* Default Folder Access */}
                <div className="pt-2">
                  <label className="block font-semibold text-[#25211E] mb-1.5">
                    Default Folder Access Policy for Newly Created Folders
                  </label>
                  <select
                    value={permissions.defaultFolderAccess}
                    onChange={(e) => setPermissions({ ...permissions, defaultFolderAccess: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F]"
                  >
                    <option value="Restricted (Explicit Member Selection)">
                      Restricted (Explicit Member Selection)
                    </option>
                    <option value="All Organization Members">All Organization Members</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-[#F3E8DC] flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave('Access control policies saved.')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Permissions</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 4: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-[#25211E]">Connected Enterprise Integrations</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Sync external cloud repositories and pipe AI retrieval tools to messaging tools.
                </p>
              </div>

              {/* 4 Integration Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {integrations.map((item) => {
                  const isConnected = item.status === 'Connected';
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex flex-col justify-between hover:border-[#96613F]/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-[#25211E]">{item.name}</h4>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isConnected
                                ? 'bg-[#EEF5F0] text-[#2B6141] border-[#CBE3D3]'
                                : 'bg-[#FFFFFF] text-[#77716B] border-[#E8DCD1]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConnected ? 'bg-[#2B6141]' : 'bg-[#77716B]'
                              }`}
                            />
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#77716B] leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-[#E8DCD1]">
                        <button
                          type="button"
                          onClick={() => toast.success(`${item.name} configuration clicked.`)}
                          className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold border transition-colors ${item.actionStyle}`}
                        >
                          {item.actionText}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 5: GENERAL (ADMIN PROFILE & SECURITY) */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-8"
            >
              {/* Section 1: Admin Profile */}
              <div>
                <h3 className="text-base font-bold text-[#25211E]">Admin Profile & Security</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Update your administrator profile details, change password, or sign out.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Admin Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Admin Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Role Title</label>
                    <input
                      type="text"
                      disabled
                      value={profileData.role}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8DCD1] rounded-[10px] text-[#77716B] font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => handleSave('Admin profile updated.')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Profile</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Change Password */}
              <div className="pt-6 border-t border-[#F3E8DC]">
                <h4 className="text-sm font-bold text-[#25211E]">Change Administrator Password</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] focus:bg-white focus:outline-none focus:border-[#96613F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] focus:bg-white focus:outline-none focus:border-[#96613F]"
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
                      handleSave('Administrator password updated successfully.');
                      setProfileData({ ...profileData, currentPassword: '', newPassword: '' });
                    }}
                    className="px-4 py-2 rounded-[8px] bg-white hover:bg-[#FAF7F2] border border-[#E8DCD1] hover:border-[#96613F] text-xs font-semibold text-[#25211E] transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Section 3: End Session / Logout */}
              <div className="pt-6 border-t border-[#F3E8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#25211E]">End Administrator Session</h4>
                  <p className="text-xs text-[#77716B] mt-0.5">
                    Revoke current browser authentication and return to the login screen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FDF0EF] hover:bg-[#A83833] text-[#A83833] hover:text-white border border-[#F3C9C6] text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
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