import { useEffect, useState } from "react";
import { initialDashboardStats } from "../data/dashboardData";
import { FolderKanban, FileText, MessageSquare, HardDrive, FolderOpen } from "lucide-react";
import { getStoredUser } from "../services/authService";
import { documentService } from "../services/documentService";

// Module-level cache taaki tab/page switch karne par baar-baar loading na dikhe
let cachedDashboardStats = null;
let cachedUserId = null;

// Logout ke time is function ko call kar sakti hain taaki naye user ke liye fresh load ho
export function clearDashboardCache() {
  cachedDashboardStats = null;
  cachedUserId = null;
}

export default function MemberDashboard() {
  const member = getStoredUser();
  const currentUserId = member?.id || member?.email || "default";

  // Agar same user ka data pehle se cached hai, toh loading false rahegi
  const hasCache = cachedDashboardStats && cachedUserId === currentUserId;

  const [stats, setStats] = useState(
    hasCache ? cachedDashboardStats : initialDashboardStats
  );
  const [isLoading, setIsLoading] = useState(!hasCache);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      // Sirf tabhi loading spinner/dots dikhayein jab cache na ho (jaise fresh login par)
      if (!hasCache) {
        setIsLoading(true);
      }

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

      const updatedStats = {
        permittedFolders: folders.length,
        totalDocuments: documents.length,
        activeChats: conversations.length,
        storageUsed: `${storageUsed.toFixed(1)} MB`,
      };

      // Cache update karein
      cachedDashboardStats = updatedStats;
      cachedUserId = currentUserId;

      setStats(updatedStats);

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
  }, [currentUserId, hasCache]);

  return (
    <div className="space-y-8">
      {/* Light Blush Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E3B8BE] bg-gradient-to-br from-[#FCECEF] via-[#F9E2E6] to-[#F3DADF] p-8 text-[#5E232B] shadow-xs">
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#E8B8C0]/35 blur-2xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="rounded-full border border-[#E2B8BE] bg-white/85 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#853842]">
                RAG Engine Online • Secure Workspace
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold text-[#5A232B] sm:text-4xl">
              Welcome back, <span className="text-[#9E4752]">{member?.name || "Member"}</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#6E3B43]">
              Access your permitted organizational knowledge base, explore documents, and chat with AI securely.
            </p>
          </div>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Could not load all workspace data: {loadError}
        </div>
      )}

      {/* Statistics Grid with Lucide Icons */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Permitted Folders */}
        <div className="relative rounded-2xl border border-[#E8C8CC] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6268]">
              Permitted Folders
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E5E8] text-[#9E4752]">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#5E232B]">
            {isLoading ? "..." : stats.permittedFolders}
          </p>
          <div className="mt-3 inline-block rounded-md border border-[#F2DCE0] bg-[#FDF6F6] px-2.5 py-1 text-[11px] font-medium text-[#6E2D36]">
            Assigned by Admin
          </div>
        </div>

        {/* Accessible Documents */}
        <div className="relative rounded-2xl border border-[#E8C8CC] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6268]">
              Accessible Documents
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E5E8] text-[#9E4752]">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#5E232B]">
            {isLoading ? "..." : stats.totalDocuments}
          </p>
          <div className="mt-3 inline-block rounded-md border border-[#F2DCE0] bg-[#FDF6F6] px-2.5 py-1 text-[11px] font-medium text-[#6E2D36]">
            Ready for query
          </div>
        </div>

        {/* Active Chats */}
        <div className="relative rounded-2xl border border-[#E8C8CC] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6268]">
              Active Chats
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E5E8] text-[#9E4752]">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#5E232B]">
            {isLoading ? "..." : stats.activeChats}
          </p>
          <div className="mt-3 inline-block rounded-md border border-[#F2DCE0] bg-[#FDF6F6] px-2.5 py-1 text-[11px] font-medium text-[#6E2D36]">
            Conversations started
          </div>
        </div>

        {/* Storage Used */}
        <div className="relative rounded-2xl border border-[#E8C8CC] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6268]">
              Storage Used
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E5E8] text-[#9E4752]">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#5E232B]">
            {isLoading ? "..." : stats.storageUsed}
          </p>
          <div className="mt-3 inline-block rounded-md border border-[#F2DCE0] bg-[#FDF6F6] px-2.5 py-1 text-[11px] font-medium text-[#6E2D36]">
            Allocated limit
          </div>
        </div>
      </div>

      {/* Empty State Section */}
      <div className="rounded-3xl border border-[#E8C8CC] bg-white p-8 text-center shadow-2xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8E5E8] text-[#9E4752]">
          <FolderOpen className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-[#5E232B]">
          {isLoading
            ? "Loading your workspace..."
            : stats.totalDocuments > 0
              ? "Your Documents Are Ready"
              : "No Recent Activity Found"}
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-[#8C6268]">
          {stats.totalDocuments > 0
            ? `You can explore ${stats.totalDocuments} accessible document${stats.totalDocuments === 1 ? "" : "s"} or start a chat.`
            : "You currently do not have any accessible documents or chat history. Ask your administrator to assign a folder."}
        </p>
      </div>
    </div>
  );
}