import { useEffect, useState } from "react";
import { initialDashboardStats } from "../data/dashboardData";
import { FolderKanban, FileText, MessageSquare, HardDrive, FolderOpen } from "lucide-react";
import { getStoredUser } from "../services/authService";
import { documentService } from "../services/documentService";

export default function MemberDashboard() {
  const [stats, setStats] = useState(initialDashboardStats);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const member = getStoredUser();

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const results = await Promise.allSettled([
        documentService.getFolders(),
        documentService.getDocuments(),
        documentService.getConversations(),
      ]);

      if (!active) return;

      const [foldersResult, documentsResult, conversationsResult] = results;
      const folders =
        foldersResult.status === "fulfilled" ? foldersResult.value : [];
      const documents =
        documentsResult.status === "fulfilled" ? documentsResult.value : [];
      const conversations =
        conversationsResult.status === "fulfilled"
          ? conversationsResult.value
          : [];
      const storageUsed = documents.reduce((total, document) => {
        const sizeInMb = Number.parseFloat(document.size) || 0;
        return total + sizeInMb;
      }, 0);

      setStats({
        permittedFolders: folders.length,
        totalDocuments: documents.length,
        activeChats: conversations.length,
        storageUsed: `${storageUsed.toFixed(1)} MB`,
      });

      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason?.message || "A dashboard resource failed to load.");
      setLoadError(errors.join(" "));
      setIsLoading(false);
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#722F37] p-8 text-white shadow-xl">
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#D7A781]/20 blur-2xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="rounded-full bg-[#D7A781]/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#D7A781]">
                RAG Engine Online • Secure Workspace
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Welcome back, <span className="text-[#D7A781]">{member?.name || "Member"}</span>
            </h1>
            <p className="mt-2 text-sm text-white/80 max-w-xl">
              Access your permitted organizational knowledge base, explore documents, and chat with AI securely.
            </p>
          </div>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load all workspace data: {loadError}
        </div>
      )}

      {/* Statistics Grid with Lucide Icons */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Permitted Folders */}
        <div className="relative rounded-2xl border border-white bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Permitted Folders</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D7A781]/15 text-[#722F37]">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#722F37]">
            {isLoading ? "..." : stats.permittedFolders}
          </p>
          <div className="mt-3 inline-block rounded-md bg-[#F8F4E7] px-2.5 py-1 text-[11px] font-medium text-[#722F37]">
            Assigned by Admin
          </div>
        </div>

        {/* Accessible Documents */}
        <div className="relative rounded-2xl border border-white bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Accessible Documents</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D7A781]/15 text-[#722F37]">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#722F37]">
            {isLoading ? "..." : stats.totalDocuments}
          </p>
          <div className="mt-3 inline-block rounded-md bg-[#F8F4E7] px-2.5 py-1 text-[11px] font-medium text-[#722F37]">
            Ready for query
          </div>
        </div>

        {/* Active Chats */}
        <div className="relative rounded-2xl border border-white bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Chats</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D7A781]/15 text-[#722F37]">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#722F37]">
            {isLoading ? "..." : stats.activeChats}
          </p>
          <div className="mt-3 inline-block rounded-md bg-[#F8F4E7] px-2.5 py-1 text-[11px] font-medium text-[#722F37]">
            Conversations started
          </div>
        </div>

        {/* Storage Used */}
        <div className="relative rounded-2xl border border-white bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Storage Used</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D7A781]/15 text-[#722F37]">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#722F37]">
            {isLoading ? "..." : stats.storageUsed}
          </p>
          <div className="mt-3 inline-block rounded-md bg-[#F8F4E7] px-2.5 py-1 text-[11px] font-medium text-[#722F37]">
            Allocated limit
          </div>
        </div>
      </div>

      {/* Empty State Section */}
      <div className="rounded-3xl border border-[#D7A781]/30 bg-white/90 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#722F37]/10 text-[#722F37]">
          <FolderOpen className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-[#722F37]">
          {isLoading
            ? "Loading your workspace..."
            : stats.totalDocuments > 0
              ? "Your Documents Are Ready"
              : "No Recent Activity Found"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
          {stats.totalDocuments > 0
            ? `You can explore ${stats.totalDocuments} accessible document${stats.totalDocuments === 1 ? "" : "s"} or start a chat.`
            : "You currently do not have any accessible documents or chat history. Ask your administrator to assign a folder."}
        </p>
      </div>
    </div>
  );
}