import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FolderKanban,
  Users,
  Upload,
  MessageSquareText,
  Sparkles,
  Inbox
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Baad mein yeh saari states backend API (useEffect -> fetch) se populate hongi
  const [documents] = useState([]);
  const [folders] = useState([]);
  const [members] = useState([]);
  const [recentActivities] = useState([]);

  // Pipeline status counts (Backend connect hone par dynamic calculate honge)
  const completedCount = documents.filter((d) => d.status === 'Completed').length;
  const processingCount = documents.filter((d) => d.status === 'Processing').length;
  const pendingCount = documents.filter((d) => d.status === 'Pending').length;
  const failedCount = documents.filter((d) => d.status === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#96613F]">
            <Sparkles className="w-3.5 h-3.5" />
            Infera AI Enterprise Workspace
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] mt-1">
            Welcome back, Jiya Sharma
          </h2>
          <p className="text-sm text-[#77716B] mt-1">
            Your organization knowledge base overview and ingestion telemetry.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs sm:text-sm font-medium transition-colors"
          >
            <MessageSquareText className="w-4 h-4 text-[#96613F]" />
            <span>Open AI Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Exactly 3 StatCards (Total Chats Hata Diya Hai) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Documents"
          value={documents.length}
          trend="+0 this week"
          subtitle="Indexed vector chunks"
          icon={FileText}
          onClick={() => navigate('/documents')}
        />
        <StatCard
          title="Total Folders"
          value={folders.length}
          trend="100% ACL enforced"
          subtitle="Department repositories"
          icon={FolderKanban}
          onClick={() => navigate('/folders')}
        />
        <StatCard
          title="Total Members"
          value={members.length}
          trend="Role based access"
          subtitle="Active organization users"
          icon={Users}
          onClick={() => navigate('/members')}
        />
      </div>

      {/* 3. Document Processing Status Breakdown */}
      <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#25211E]">
              Document Processing Status
            </h3>
            <p className="text-xs text-[#77716B] mt-0.5">
              Real-time ingestion and vector embedding pipeline health
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="text-xs font-semibold text-[#96613F] hover:underline"
          >
            Manage Documents →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Completed */}
          <div className="p-4 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#2B6141]">Completed (Indexed)</span>
              <span className="text-[#25211E]">{completedCount} docs</span>
            </div>
            <div className="w-full h-2 bg-[#E8DCD1] rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-[#2B6141] rounded-full transition-all"
                style={{
                  width: `${documents.length > 0 ? (completedCount / documents.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          {/* Processing */}
          <div className="p-4 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#96613F]">Processing (Chunking)</span>
              <span className="text-[#25211E]">{processingCount} docs</span>
            </div>
            <div className="w-full h-2 bg-[#E8DCD1] rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-[#96613F] rounded-full transition-all"
                style={{
                  width: `${documents.length > 0 ? (processingCount / documents.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          {/* Pending */}
          <div className="p-4 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#9A6B26]">Pending Queue</span>
              <span className="text-[#25211E]">{pendingCount} docs</span>
            </div>
            <div className="w-full h-2 bg-[#E8DCD1] rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-[#9A6B26] rounded-full transition-all"
                style={{
                  width: `${documents.length > 0 ? (pendingCount / documents.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          {/* Failed */}
          <div className="p-4 rounded-[10px] bg-[#FAF7F2] border border-[#E8DCD1]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#A83833]">Failed (Needs OCR)</span>
              <span className="text-[#25211E]">{failedCount} docs</span>
            </div>
            <div className="w-full h-2 bg-[#E8DCD1] rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-[#A83833] rounded-full transition-all"
                style={{
                  width: `${documents.length > 0 ? (failedCount / documents.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Documents Table (Left) + Recent Activity (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Recent Uploaded Documents Table */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#25211E]">
                Recent Uploaded Documents
              </h3>
              <p className="text-xs text-[#77716B]">
                Latest knowledge assets uploaded by team members
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="text-xs font-semibold text-[#96613F] hover:underline"
            >
              View All Documents →
            </button>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] shadow-sm overflow-hidden">
            {documents.length === 0 ? (
              // Empty State jab tak backend se documents na aayein
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-[#25211E]">No documents uploaded yet</h4>
                <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1">
                  Upload your organization PDF, DOCX, or TXT policies to start indexing.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/documents')}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload First Document</span>
                </button>
              </div>
            ) : (
              // Backend se data aane par yeh table rows render hongi
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#E8DCD1] text-xs font-semibold text-[#77716B] uppercase">
                      <th className="px-4 py-3">Document Name</th>
                      <th className="px-4 py-3">Folder</th>
                      <th className="px-4 py-3">File Size</th>
                      <th className="px-4 py-3">Upload Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DCD1]">
                    {documents.slice(0, 5).map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#FAF7F2]/60">
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
              <h3 className="text-base font-semibold text-[#25211E]">
                Recent Activity
              </h3>
              <p className="text-xs text-[#77716B]">Audit trail of workspace events</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1]">
              Live Log
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] p-5 shadow-sm">
            {recentActivities.length === 0 ? (
              // Empty State jab tak koi activity na ho
              <div className="py-10 text-center">
                <p className="text-xs font-medium text-[#25211E]">No recent activity logged</p>
                <p className="text-[11px] text-[#77716B] mt-1">
                  Actions like uploads and ACL changes will appear here.
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
      </div>
    </div>
  );
}