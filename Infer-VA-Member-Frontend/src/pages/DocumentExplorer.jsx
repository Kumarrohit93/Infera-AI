import { useEffect, useState } from "react";
import { FileText, FolderOpen } from "lucide-react";
import { documentService } from "../services/documentService";

export default function DocumentExplorer() {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      documentService.getFolders(),
      documentService.getDocuments(),
    ])
      .then(([folderList, documentList]) => {
        if (!active) return;
        setFolders(folderList);
        setDocuments(documentList);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Failed to load assigned documents.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const documentsByFolder = folders.map((folder) => ({
    ...folder,
    documents: documents.filter((document) => document.folderId === folder.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#722F37]">Document Explorer</h1>
          <p className="text-sm text-gray-500">Browse folders and documents you have permission to access.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-[#D7A781]/30 bg-white/90 p-8 text-center text-sm text-gray-500">
          Loading your assigned folders and documents...
        </div>
      ) : documentsByFolder.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[#D7A781]/30 bg-white/90 p-8 text-center shadow-sm">
          <FolderOpen className="mb-3 h-10 w-10 text-[#722F37]" />
          <h3 className="text-lg font-bold text-[#722F37]">No Folders Assigned</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Ask your administrator to assign a folder to your member account.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {documentsByFolder.map((folder) => (
            <section
              key={folder.id}
              className="rounded-3xl border border-[#D7A781]/30 bg-white/90 p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-[#722F37]" />
                  <div>
                    <h2 className="font-bold text-[#722F37]">{folder.name}</h2>
                    {folder.description && (
                      <p className="text-sm text-gray-500">{folder.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {folder.documents.length} accessible
                </span>
              </div>

              {folder.documents.length === 0 ? (
                <p className="rounded-xl bg-[#F8F4E7] p-4 text-sm text-gray-500">
                  No documents are available in this folder yet.
                </p>
              ) : (
                <div className="divide-y divide-[#D7A781]/20">
                  {folder.documents.map((document) => (
                    <article
                      key={document.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-[#722F37]" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#722F37]">
                            {document.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {document.size} · {document.uploadDate || "Date unavailable"}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {document.status}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}