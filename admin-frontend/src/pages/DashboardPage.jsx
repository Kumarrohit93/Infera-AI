import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { documentApi, folderApi, memberApi } from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  FileText,
  FolderKanban,
  Users,
  Upload,
  MessageSquareText,
  Inbox,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  }
};

// Custom luxury tooltip for Recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E8DCD1] rounded-[12px] p-3 shadow-xl text-xs space-y-1.5">
        <p className="font-bold text-[#25211E] border-b border-[#F3E8DC] pb-1">{label}</p>
        <p className="text-[#96613F] font-semibold flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#96613F]" />
            Queries:
          </span>
          <span className="font-bold">{payload[0].value}</span>
        </p>
        <p className="text-[#2B6141] font-semibold flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2B6141]" />
            Citations:
          </span>
          <span className="font-bold">{payload[1].value}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Range toggle
  const [chartRange, setChartRange] = useState('7d');

  // Upload folder modal state
  const [isUploadFolderModalOpen, setIsUploadFolderModalOpen] = useState(false);
  const [targetUploadFolder, setTargetUploadFolder] = useState('');

  // TanStack Query: Live cache connection for documents, folders and members (ZERO MOCK DATA)
  const { data: documents = [] } = useQuery({
    queryKey: ['documents', 'All'],
    queryFn: async () => {
      try {
        const res = await documentApi.getDocuments('All');
        return Array.isArray(res) ? res : [];
      } catch (err) {
        return queryClient.getQueryData(['documents', 'All']) ?? [];
      }
    },
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      try {
        const res = await folderApi.getFolders();
        return Array.isArray(res) ? res : [];
      } catch (err) {
        return queryClient.getQueryData(['folders']) ?? [];
      }
    },
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      try {
        const res = await memberApi.getMembers();
        return Array.isArray(res) ? res : [];
      } catch (err) {
        return queryClient.getQueryData(['members']) ?? [];
      }
    },
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Sync targetUploadFolder with available folders
  useEffect(() => {
    if (folders.length > 0) {
      const stillExists = folders.some((f) => f.name === targetUploadFolder);
      if (!targetUploadFolder || !stillExists) {
        setTargetUploadFolder(folders[0].name);
      }
    } else {
      setTargetUploadFolder('');
    }
  }, [folders, targetUploadFolder]);

  // Zero mock data - backend se aayega
  const [chartData] = useState([]);
  const [recentActivities] = useState([]);

  // Pipeline calculations
  const completedCount = documents.filter((d) => d.status === 'Completed').length;
  const processingCount = documents.filter((d) => d.status === 'Processing').length;
  const pendingCount = documents.filter((d) => d.status === 'Pending').length;
  const failedCount = documents.filter((d) => d.status === 'Failed').length;

  // Handle File Upload from Dashboard
  const processFiles = (filesList) => {
    const files = Array.from(filesList || []);
    if (files.length === 0) return;

    if (!targetUploadFolder) {
      toast.error('Please create a folder in Folders page first before uploading.');
      return;
    }

    const chosenFolder = targetUploadFolder;
    const newDocs = files.map((file, idx) => ({
      id: Date.now() + idx,
      name: file.name,
      extension: file.name.split('.').pop().toUpperCase(),
      folder: chosenFolder,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      pages: Math.floor(Math.random() * 40) + 12,
      chunks: Math.floor(Math.random() * 150) + 35
    }));

    queryClient.setQueryData(['documents', 'All'], (prev = []) => [...newDocs, ...prev]);
    queryClient.setQueryData(['folders'], (prev = []) =>
      prev.map((f) =>
        f.name === chosenFolder
          ? { ...f, docCount: (f.docCount || 0) + newDocs.length }
          : f
      )
    );

    toast.success(`${files.length} document(s) uploaded to "${chosenFolder}"!`);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-7 pb-12 relative"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Subtle Background Radial Ambient Glow */}
        <div className="absolute top-10 right-20 w-96 h-96 rounded-full bg-[#F3E8DC]/40 blur-3xl pointer-events-none -z-10" />

        {/* 1. Welcome Banner with Luxury Gradient & Telemetry Status */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#FFFFFF] to-[#FAF7F2] border border-[#E8DCD1] hover:border-[#96613F]/40 rounded-[18px] p-6 sm:p-8 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(150,97,63,0.12)] transition-all duration-300"
        >
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              {/* Live Telemetry Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3E8DC]/80 border border-[#E8DCD1] text-[11px] font-bold uppercase tracking-wider text-[#96613F] shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B6141] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B6141]" />
                </span>
                <span>RAG Engine Online • Strict Grounding v2.4</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25211E] tracking-tight">
                Welcome back, Jiya Sharma
              </h2>
              <p className="text-xs sm:text-sm text-[#77716B] leading-relaxed">
                Organization telemetry, semantic chunking health, and role-based knowledge access.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsUploadFolderModalOpen(true)}
                className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>Upload Documents</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-white hover:bg-[#FAF7F2] text-[#25211E] border border-[#E8DCD1] hover:border-[#96613F]/50 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
              >
                <MessageSquareText className="w-4 h-4 text-[#96613F]" />
                <span>Open AI Chat</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 2. 3 StatCards with Interactive Lift & Golden-Brown Glow */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_-8px_rgba(150,97,63,0.15)] rounded-[14px]">
            <StatCard
              title="Total Documents"
              value={documents.length}
              trend="+0 this week"
              subtitle="Indexed vector chunks"
              icon={FileText}
              onClick={() => navigate('/documents')}
            />
          </div>
          <div className="transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_-8px_rgba(150,97,63,0.15)] rounded-[14px]">
            <StatCard
              title="Total Folders"
              value={folders.length}
              trend="100% ACL enforced"
              subtitle="Department repositories"
              icon={FolderKanban}
              onClick={() => navigate('/folders')}
            />
          </div>
          <div className="transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_-8px_rgba(150,97,63,0.15)] rounded-[14px] sm:col-span-2 lg:col-span-1">
            <StatCard
              title="Total Members"
              value={members.length}
              trend="Role based access"
              subtitle="Active organization users"
              icon={Users}
              onClick={() => navigate('/members')}
            />
          </div>
        </motion.div>

        {/* 3. Query Activity Chart (2 Cols) & Pipeline Status (1 Col) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recharts AreaChart with Zero Mock Data */}
          <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E8DCD1] hover:border-[#96613F]/40 rounded-[16px] p-5 sm:p-7 shadow-sm hover:shadow-[0_10px_28px_-10px_rgba(150,97,63,0.12)] transition-all duration-300 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F3E8DC]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#F3E8DC] text-[#96613F] flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#25211E]">
                    Recent Query & Citation Activity
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#77716B]">
                    Daily user questions vs grounded citations returned
                  </p>
                </div>
              </div>

              {/* 7D vs 30D Filter Pill */}
              <div className="inline-flex items-center p-1 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartRange('7d')}
                  className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                    chartRange === '7d'
                      ? 'bg-[#96613F] text-white shadow-xs'
                      : 'text-[#77716B] hover:text-[#25211E]'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange('30d')}
                  className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                    chartRange === '30d'
                      ? 'bg-[#96613F] text-white shadow-xs'
                      : 'text-[#77716B] hover:text-[#25211E]'
                  }`}
                >
                  Last 30 Days
                </button>
              </div>
            </div>

            {/* Chart or Clean Empty State */}
            <div className="h-64 sm:h-72 w-full pt-4 flex items-center justify-center">
              {chartData.length === 0 ? (
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-center text-[#77716B] mx-auto mb-3 shadow-inner">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#25211E]">No query activity recorded yet</h4>
                  <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
                    Daily search questions and vector citations will plot here once members query the knowledge base.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="queryGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#96613F" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#96613F" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="citeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2B6141" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2B6141" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3E8DC" vertical={false} />
                    <XAxis dataKey="day" stroke="#77716B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#77716B" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="queries"
                      stroke="#96613F"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#queryGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="citations"
                      stroke="#2B6141"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#citeGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right: Document Processing Pipeline (1 Col) */}
          <div className="bg-[#FFFFFF] border border-[#E8DCD1] hover:border-[#96613F]/40 rounded-[16px] p-5 sm:p-7 shadow-sm hover:shadow-[0_10px_28px_-10px_rgba(150,97,63,0.12)] transition-all duration-300 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3E8DC]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#96613F]" />
                <h3 className="text-sm font-bold text-[#25211E]">Pipeline Status</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#96613F] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8DCD1]">
                Vector Index
              </span>
            </div>

            <div className="space-y-3.5 my-auto py-3">
              {/* Completed */}
              <div className="p-3 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2B6141] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                  <span className="font-bold text-[#25211E]">{completedCount} docs</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8DCD1] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#2B6141] rounded-full transition-all duration-700"
                    style={{
                      width: `${documents.length > 0 ? (completedCount / documents.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Processing */}
              <div className="p-3 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#96613F] flex items-center gap-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 ${processingCount > 0 ? 'animate-spin' : ''}`} />
                    Processing
                  </span>
                  <span className="font-bold text-[#25211E]">{processingCount} docs</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8DCD1] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#96613F] rounded-full transition-all duration-700"
                    style={{
                      width: `${documents.length > 0 ? (processingCount / documents.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Pending */}
              <div className="p-3 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#9A6B26] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Queue
                  </span>
                  <span className="font-bold text-[#25211E]">{pendingCount} docs</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8DCD1] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#9A6B26] rounded-full transition-all duration-700"
                    style={{
                      width: `${documents.length > 0 ? (pendingCount / documents.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Failed */}
              <div className="p-3 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#A83833] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Failed
                  </span>
                  <span className="font-bold text-[#25211E]">{failedCount} docs</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8DCD1] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#A83833] rounded-full transition-all duration-700"
                    style={{
                      width: `${documents.length > 0 ? (failedCount / documents.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="w-full text-center py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#4A3023] text-xs font-bold border border-[#E8DCD1] transition-colors shadow-xs cursor-pointer"
            >
              Manage Documents →
            </button>
          </div>
        </motion.div>

        {/* 4. Bottom Row: Recent Documents Table (Left) + Recent Activity (Right) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Recent Uploaded Documents Table */}
          <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#25211E]">
                  Recent Uploaded Documents
                </h3>
                <p className="text-[11px] sm:text-xs text-[#77716B]">
                  Latest knowledge assets uploaded by team members
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#96613F] hover:text-[#4A3023] transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8DCD1] hover:border-[#96613F]/30 rounded-[16px] shadow-sm hover:shadow-[0_10px_28px_-10px_rgba(150,97,63,0.12)] overflow-hidden transition-all duration-300">
              {documents.length === 0 ? (
                <div className="p-10 sm:p-14 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-3 shadow-inner">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#25211E]">No documents uploaded yet</h4>
                  <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
                    Upload your organization PDF, DOCX, or TXT policies to start indexing.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsUploadFolderModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload First Document</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm min-w-[580px]">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#E8DCD1] text-[11px] font-bold text-[#77716B] uppercase tracking-wider">
                        <th className="px-4 py-3">Document Name</th>
                        <th className="px-4 py-3">Folder</th>
                        <th className="px-4 py-3">File Size</th>
                        <th className="px-4 py-3">Upload Date</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DCD1]">
                      {documents.slice(0, 5).map((doc) => (
                        <tr key={doc.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="px-4 py-3 font-medium text-[#25211E]">{doc.name}</td>
                          <td className="px-4 py-3 text-xs">{doc.folder}</td>
                          <td className="px-4 py-3 text-xs text-[#77716B]">{doc.size}</td>
                          <td className="px-4 py-3 text-xs text-[#77716B]">{doc.uploadDate}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={doc.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Recent Activity Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#25211E]">
                  Recent Activity
                </h3>
                <p className="text-[11px] sm:text-xs text-[#77716B]">Audit trail of workspace events</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF5F0] text-[#2B6141] border border-[#CBE3D3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B6141] animate-ping" />
                Live Log
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8DCD1] hover:border-[#96613F]/30 rounded-[16px] p-5 shadow-sm hover:shadow-[0_10px_28px_-10px_rgba(150,97,63,0.12)] transition-all duration-300">
              {recentActivities.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-xs font-semibold text-[#25211E]">No recent activity logged</p>
                  <p className="text-[11px] text-[#77716B] mt-1 max-w-xs mx-auto">
                    Actions like uploads and ACL changes will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8DCD1]">
                  {recentActivities.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-xs text-[#25211E]">
                        <span className="font-semibold">{item.actor}</span>{' '}
                        <span className="text-[#77716B]">{item.action}</span>{' '}
                        <span className="font-semibold text-[#96613F]">{item.target}</span>
                      </p>
                      <p className="text-[10px] text-[#77716B] mt-0.5">{item.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Step-1 Upload Modal: Ask Target Folder First (Portal to document.body) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isUploadFolderModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-md w-full p-5 sm:p-6 shadow-2xl relative"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD1]">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-5 h-5 text-[#96613F]" />
                      <h3 className="font-bold text-sm sm:text-base text-[#25211E]">
                        Select Target Folder
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUploadFolderModalOpen(false)}
                      className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {folders.length === 0 ? (
                    <div className="mt-4 space-y-4 text-xs">
                      <div className="bg-[#FAF7F2] border border-[#E8DCD1] rounded-[12px] p-4 text-center">
                        <p className="font-semibold text-[#25211E]">No folders created yet</p>
                        <p className="text-[#77716B] mt-1 leading-relaxed">
                          Please create at least one folder in the Folders page before uploading documents.
                        </p>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-[#E8DCD1]">
                        <button
                          type="button"
                          onClick={() => setIsUploadFolderModalOpen(false)}
                          className="px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] font-semibold transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-[#25211E] mb-1.5">
                          Which folder do you want to upload documents into?
                        </label>
                        <select
                          value={targetUploadFolder}
                          onChange={(e) => setTargetUploadFolder(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-semibold text-[#25211E] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                        >
                          {folders.map((folder) => (
                            <option key={folder.id || folder.name} value={folder.name}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-[#E8DCD1]">
                        <button
                          type="button"
                          onClick={() => setIsUploadFolderModalOpen(false)}
                          className="px-3.5 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUploadFolderModalOpen(false);
                            fileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose File & Upload</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}