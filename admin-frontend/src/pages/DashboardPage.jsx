import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Sparkles,
  Inbox,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

// Custom luxury tooltip for Recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[10px] p-3 shadow-lg text-xs space-y-1">
        <p className="font-bold text-[#25211E] border-b border-[#F3E8DC] pb-1">{label}</p>
        <p className="text-[#96613F] font-semibold flex items-center justify-between gap-4">
          <span>Queries:</span>
          <span>{payload[0].value}</span>
        </p>
        <p className="text-[#2B6141] font-semibold flex items-center justify-between gap-4">
          <span>Cited Answers:</span>
          <span>{payload[1].value}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  // Range toggle
  const [chartRange, setChartRange] = useState('7d');

  // Completely empty state - ZERO mock data (backend se aayega)
  const [chartData] = useState([]);
  const [documents] = useState([]);
  const [folders] = useState([]);
  const [members] = useState([]);
  const [recentActivities] = useState([]);

  // Pipeline calculations
  const completedCount = documents.filter((d) => d.status === 'Completed').length;
  const processingCount = documents.filter((d) => d.status === 'Processing').length;
  const pendingCount = documents.filter((d) => d.status === 'Pending').length;
  const failedCount = documents.filter((d) => d.status === 'Failed').length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-7 pb-10"
    >
      {/* 1. Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#FFFFFF] to-[#FAF7F2] border border-[#E8DCD1] rounded-[16px] p-5 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#D9C7B6]"
      >
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#F3E8DC]/40 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F3E8DC]/70 border border-[#E8DCD1] text-[11px] font-bold uppercase tracking-wider text-[#96613F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#96613F] animate-pulse" />
              Infera AI Enterprise Workspace
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#25211E] tracking-tight">
              Welcome back, Jiya Sharma
            </h2>
            <p className="text-xs sm:text-sm text-[#77716B] leading-relaxed">
              Real-time telemetry, semantic chunking pipelines, and role-based knowledge access.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>Upload Documents</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#25211E] border border-[#E8DCD1] hover:border-[#96613F]/50 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-[0.98]"
            >
              <MessageSquareText className="w-4 h-4 text-[#96613F]" />
              <span>Open AI Chat</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. 3 StatCards with Hover Lift */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="transition-all duration-300 hover:-translate-y-1">
          <StatCard
            title="Total Documents"
            value={documents.length}
            trend="+0 this week"
            subtitle="Indexed vector chunks"
            icon={FileText}
            onClick={() => navigate('/documents')}
          />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1">
          <StatCard
            title="Total Folders"
            value={folders.length}
            trend="100% ACL enforced"
            subtitle="Department repositories"
            icon={FolderKanban}
            onClick={() => navigate('/folders')}
          />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
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
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#D9C7B6] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F3E8DC]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F3E8DC] text-[#96613F] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
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
                className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-all ${
                  chartRange === '7d'
                    ? 'bg-[#96613F] text-white shadow-sm'
                    : 'text-[#77716B] hover:text-[#25211E]'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange('30d')}
                className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-all ${
                  chartRange === '30d'
                    ? 'bg-[#96613F] text-white shadow-sm'
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
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-center text-[#77716B] mx-auto mb-3">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-[#25211E]">No query activity recorded yet</h4>
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
        <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#D9C7B6] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3E8DC]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#96613F]" />
              <h3 className="text-sm font-bold text-[#25211E]">Pipeline Status</h3>
            </div>
            <span className="text-[11px] font-semibold text-[#96613F]">Vector Index</span>
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
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
            className="w-full text-center py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#4A3023] text-xs font-semibold border border-[#E8DCD1] transition-colors"
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
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#96613F] hover:text-[#4A3023] transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#D9C7B6]">
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
                  onClick={() => navigate('/documents')}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm"
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
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EEF5F0] text-[#2B6141] border border-[#CBE3D3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B6141] animate-ping" />
              Live Log
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#D9C7B6]">
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
  );
}