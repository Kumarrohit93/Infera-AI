import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, folderApi } from '../services/api';
import {
  Upload,
  Search,
  FileText,
  Trash2,
  Eye,
  Inbox,
  Filter,
  X,
  Loader2,
  FolderKanban
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { TableSkeleton } from '../components/SkeletonLoader';
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
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const versionInputRef = useRef(null);
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const selectedFolderFilter = searchParams.get('folder') || 'All';
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [targetUploadFolder, setTargetUploadFolder] = useState('');
  const [isUploadFolderModalOpen, setIsUploadFolderModalOpen] = useState(false);

  // TanStack Query: Fetch Folders dynamically (Synchronised with FoldersPage, Zero Mock Data)
  const {
    data: folders = [],
    isFetched: foldersFetched,
    isError: foldersError,
    error: foldersQueryError
  } = useQuery({
    queryKey: ['folders'],
    queryFn: folderApi.getFolders,
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (foldersError) toast.error(foldersQueryError?.message || 'Failed to load folders.');
  }, [foldersError, foldersQueryError]);

  const selectedFolder = folders.find(
    (folder) => folder.id === selectedFolderFilter || folder.name === selectedFolderFilter
  );

  useEffect(() => {
    if (!foldersFetched || selectedFolderFilter === 'All') return;

    const nextParams = new URLSearchParams(searchParams);
    if (selectedFolder) {
      if (selectedFolderFilter === selectedFolder.id) return;
      nextParams.set('folder', selectedFolder.id);
    } else {
      nextParams.delete('folder');
    }
    setSearchParams(nextParams, { replace: true });
  }, [foldersFetched, searchParams, selectedFolder, selectedFolderFilter, setSearchParams]);

  const effectiveUploadFolder = folders.some((folder) => folder.name === targetUploadFolder)
    ? targetUploadFolder
    : folders[0]?.name || '';

  // TanStack Query: Fetch Documents (Strictly Zero Mock Data)
  const { data: serverDocs = [], isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['documents', selectedFolder?.id || selectedFolderFilter],
    queryFn: () => documentApi.getDocuments(selectedFolder?.id || 'All'),
    enabled: selectedFolderFilter === 'All' || Boolean(selectedFolder),
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      query.state.data?.some((document) =>
        ['queued', 'processing'].includes(
          (document.processingStatus || document.status).toLowerCase()
        )
      )
        ? 2000
        : false,
    retry: false,
  });

  useEffect(() => {
    if (isError) toast.error(error?.message || 'Failed to load documents.');
  }, [isError, error]);

  const documents = serverDocs;

  // Drag over visual state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Ingestion Progress Simulation State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingName, setCurrentUploadingName] = useState('');
  const [recentlyUploadedIds, setRecentlyUploadedIds] = useState(() => new Set());
  const uploadStatusTimersRef = useRef(new Map());

  useEffect(() => () => {
    uploadStatusTimersRef.current.forEach((timer) => clearTimeout(timer));
  }, []);

  const showTemporaryProcessingStatus = (documentIds) => {
    if (documentIds.length === 0) return;

    setRecentlyUploadedIds((current) => new Set([...current, ...documentIds]));
    documentIds.forEach((documentId) => {
      const previousTimer = uploadStatusTimersRef.current.get(documentId);
      if (previousTimer) clearTimeout(previousTimer);

      const timer = setTimeout(() => {
        setRecentlyUploadedIds((current) => {
          const next = new Set(current);
          next.delete(documentId);
          return next;
        });
        uploadStatusTimersRef.current.delete(documentId);
      }, 3000);

      uploadStatusTimersRef.current.set(documentId, timer);
    });
  };

  // Inspect & Delete Modal state
  const [inspectingDoc, setInspectingDoc] = useState(null);
  const [versioningDoc, setVersioningDoc] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);
  const {
    data: documentVersions = [],
    isError: versionsError,
    error: versionsQueryError,
  } = useQuery({
    queryKey: ['document-versions', inspectingDoc?.id],
    queryFn: () => documentApi.getVersions(inspectingDoc.id),
    enabled: Boolean(inspectingDoc?.id),
    refetchInterval: (query) =>
      query.state.data?.some((version) =>
        ['queued', 'processing'].includes(version.status)
      ) ? 2000 : false,
    retry: false,
  });

  useEffect(() => {
    if (versionsError) toast.error(versionsQueryError?.message || 'Failed to load document versions.');
  }, [versionsError, versionsQueryError]);

  // TanStack Mutation: Delete Document
  const deleteDocMutation = useMutation({
    mutationFn: documentApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Document removed from the knowledge base.');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete document.');
    }
  });

  // Real Backend File Upload with progress animation
  const processFiles = async (filesList) => {
    const files = Array.from(filesList || []);
    if (files.length === 0) return;

    if (!effectiveUploadFolder) {
      toast.error('Please create a folder in Folders page first before uploading.');
      return;
    }

    const matchedFolder = folders.find(
      (f) => f.name === effectiveUploadFolder || f.id === effectiveUploadFolder
    );
    const folderId = matchedFolder?.id;

    if (!folderId) {
      toast.error('Please select a valid folder.');
      return;
    }

    const firstFile = files[0];
    setCurrentUploadingName(files.length === 1 ? firstFile.name : `${files.length} documents`);
    setIsUploading(true);
    setUploadProgress(25);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 300);

    try {
      const uploadedDocumentIds = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderId', folderId);
        const result = await documentApi.uploadDocument(formData);
        const uploadedDocument = result?.document || result;
        if (uploadedDocument?.id) uploadedDocumentIds.push(uploadedDocument.id);
      }

      clearInterval(progressTimer);
      setUploadProgress(100);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['documents'] }),
        queryClient.invalidateQueries({ queryKey: ['folders'] }),
      ]);
      showTemporaryProcessingStatus(uploadedDocumentIds);

      toast.success(`${files.length} document(s) uploaded! Indexing in progress.`);
    } catch (err) {
      clearInterval(progressTimer);
      toast.error(err?.message || 'Upload failed');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 600);
    }
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleVersionFileSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !versioningDoc) return;

    const formData = new FormData();
    formData.append('file', file);
    try {
      await documentApi.uploadVersion(versioningDoc.id, formData);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['documents'] }),
        queryClient.invalidateQueries({ queryKey: ['document-versions', versioningDoc.id] }),
      ]);
      showTemporaryProcessingStatus([versioningDoc.id]);
      toast.success('New version uploaded. It will become current after indexing.');
    } catch (uploadError) {
      toast.error(uploadError?.message || 'Could not upload this document version.');
    } finally {
      setVersioningDoc(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Delete Document Handler
  const handleDelete = (doc) => {
    deleteDocMutation.mutate(doc.id);
  };

  // Format Badge Color Helper
  const getExtBadgeClass = (ext) => {
    switch ((ext || '').toUpperCase()) {
      case 'PDF':
        return 'bg-[#FDF0EF] text-[#A83833] border-[#F3C9C6]';
      case 'DOCX':
      case 'DOC':
        return 'bg-[#EFF5FB] text-[#205493] border-[#CFDFEC]';
      default:
        return 'bg-[#FAF7F2] text-[#77716B] border-[#E8DCD1]';
    }
  };

  // Search & Filter Logic
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder =
      selectedFolderFilter === 'All' ||
      doc.folderId === selectedFolder?.id ||
      doc.folder === selectedFolder?.name;
    const matchesStatus = selectedStatusFilter === 'All' || doc.status === selectedStatusFilter;
    return matchesSearch && matchesFolder && matchesStatus;
  });

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-7 pb-12"
      >
        {/* 1. Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] tracking-tight">
              Document Management
            </h2>
            <p className="text-xs sm:text-sm text-[#77716B] mt-1">
              Upload, index, and organize organization files with vector embeddings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadFolderModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
        </motion.div>

        {/* 2. Drag & Drop Upload Card with Active Glow & Progress */}
        <motion.div
          variants={itemVariants}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative overflow-hidden bg-[#FFFFFF] border-2 border-dashed rounded-[18px] p-6 sm:p-8 transition-all duration-300 shadow-sm ${
            isDraggingOver
              ? 'border-[#96613F] bg-[#FAF7F2] scale-[1.01] shadow-md'
              : 'border-[#E8DCD1] hover:border-[#96613F]/60 hover:shadow-md'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={versionInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleVersionFileSelect}
            className="hidden"
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${
                isDraggingOver ? 'bg-[#96613F] text-white rotate-6' : 'bg-[#F3E8DC] text-[#96613F] border border-[#E8DCD1]'
              }`}>
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#25211E]">
                  {isDraggingOver ? 'Drop files here to start embedding' : 'Drag and drop documents here, or click to browse'}
                </h3>
                <p className="text-xs text-[#77716B] mt-1 leading-relaxed">
                  Supports PDF, DOCX, and TXT up to 50 MB. Automatic semantic chunking and page-level vector indexing.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 lg:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#77716B] shrink-0">Target Folder:</span>
                <select
                  value={effectiveUploadFolder}
                  onChange={(e) => setTargetUploadFolder(e.target.value)}
                  disabled={folders.length === 0}
                  className="w-full sm:w-auto px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-semibold text-[#25211E] focus:outline-none focus:border-[#96613F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {folders.length === 0 ? (
                    <option value="">No folders yet</option>
                  ) : (
                    folders.map((folder) => (
                      <option key={folder.id || folder.name} value={folder.name}>
                        {folder.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsUploadFolderModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs font-semibold transition-colors text-center active:scale-95 cursor-pointer"
              >
                Browse Files
              </button>
            </div>
          </div>

          {/* Live Upload & Indexing Progress Banner */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="pt-4 border-t border-[#F3E8DC]"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#25211E] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#96613F]" />
                    <span>Embedding "{currentUploadingName}" into vector database...</span>
                  </span>
                  <span className="font-bold text-[#96613F]">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#E8DCD1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#96613F] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 3. Search Bar & Dropdown Filters Toolbar */}
        <motion.div
          variants={itemVariants}
          className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
        >
          <div className="relative flex-1 max-w-full md:max-w-md">
            <Search className="w-4 h-4 text-[#77716B] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by name..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-[#77716B]">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-semibold">Filter:</span>
            </div>

            <select
              value={selectedFolderFilter}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'All') {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.delete('folder');
                  setSearchParams(nextParams, { replace: true });
                } else {
                  setSearchParams({ folder: val }, { replace: true });
                }
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-medium text-[#25211E] focus:outline-none focus:border-[#96613F]"
            >
              <option value="All">All Folders</option>
              {folders.map((folder) => (
                <option key={folder.id || folder.name} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-medium text-[#25211E] focus:outline-none focus:border-[#96613F]"
            >
              <option value="All">All Statuses</option>
              <option value="Queued">Queued</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </motion.div>

        {/* 4. Documents Table / Skeleton / Empty State */}
        <motion.div
          variants={itemVariants}
          className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
        >
          {isLoading || (isFetching && documents.length === 0) ? (
            <TableSkeleton rows={5} columns={6} />
          ) : filteredDocuments.length === 0 ? (
            <div className="p-10 sm:p-14 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-3 shadow-inner">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#25211E]">
                {documents.length === 0 ? 'No documents uploaded yet' : 'No matching documents found'}
              </h4>
              <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
                {documents.length === 0
                  ? 'Upload your first organization policy or manual above to index it.'
                  : 'Try clearing your search query or changing folder/status filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[620px]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8DCD1] text-[11px] font-bold text-[#77716B] uppercase tracking-wider">
                    <th className="px-4 py-3">Document Name</th>
                    <th className="px-4 py-3">Folder</th>
                    <th className="px-4 py-3">File Size</th>
                    <th className="px-4 py-3">Upload Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCD1]">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[8px] bg-[#F3E8DC] text-[#96613F] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-xs sm:text-sm text-[#25211E]">
                                {doc.name}
                              </p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getExtBadgeClass(doc.extension)}`}>
                                {doc.extension || 'DOC'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#77716B] mt-0.5">
                              {doc.pages ? `${doc.pages} pages` : doc.mimeType || ''}
                              {doc.chunks ? ` • ${doc.chunks} vector chunks` : ''}
                              {doc.errorMessage ? ` • ${doc.errorMessage}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DCD1] text-[#4A3023]">
                          {doc.folder}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#77716B]">{doc.size}</td>
                      <td className="px-4 py-3 text-xs text-[#77716B]">{doc.uploadDate}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={recentlyUploadedIds.has(doc.id) ? 'Processing' : doc.uploadStatus}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectingDoc(doc)}
                            className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors cursor-pointer"
                            title="Inspect Chunks"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-lg text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* 5. Step-1 Upload Modal: Ask Target Folder First (Portal to document.body) */}
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
                      <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DCD1]">
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
                            navigate('/folders');
                          }}
                          className="px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
                        >
                          Go to Folders
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
                          value={effectiveUploadFolder}
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

      {/* 6. Document Inspection Modal (Portal to document.body) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {inspectingDoc && (
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
                  className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-lg w-full p-5 sm:p-6 shadow-2xl relative"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD1]">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 text-[#96613F] shrink-0" />
                      <h3 className="font-bold text-sm sm:text-base text-[#25211E] truncate">
                        {inspectingDoc.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectingDoc(null)}
                      className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-2.5 bg-[#FAF7F2] p-3.5 rounded-[12px] border border-[#E8DCD1]">
                      <div>
                        <span className="text-[#77716B]">Department Folder:</span>
                        <p className="font-bold text-[#25211E] mt-0.5">{inspectingDoc.folder}</p>
                      </div>
                      <div>
                        <span className="text-[#77716B]">File Size:</span>
                        <p className="font-bold text-[#25211E] mt-0.5">{inspectingDoc.size}</p>
                      </div>
                      <div>
                        <span className="text-[#77716B]">Total Pages:</span>
                        <p className="font-bold text-[#25211E] mt-0.5">{inspectingDoc.pages || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#77716B]">Vector Chunks:</span>
                        <p className="font-bold text-[#25211E] mt-0.5">{inspectingDoc.chunks || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-[#25211E] mb-1">Indexing Pipeline Details:</p>
                      <p className="text-[#77716B] leading-relaxed">
                        Chunk Size: 800 tokens • Overlap: 120 tokens • Model: gemini-embedding-001 • Dimensions: 1,536
                      </p>
                    </div>
                    <div className="border-t border-[#E8DCD1] pt-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-[#25211E]">Version history</p>
                        <button
                          type="button"
                          onClick={() => {
                            setVersioningDoc(inspectingDoc);
                            versionInputRef.current?.click();
                          }}
                          className="rounded-lg bg-[#96613F] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4A3023]"
                        >
                          Upload new version
                        </button>
                      </div>
                      <ul className="mt-2 max-h-32 space-y-2 overflow-y-auto">
                        {documentVersions.map((version) => (
                          <li
                            key={version.id}
                            className="flex items-center justify-between gap-3 rounded-lg bg-[#FAF7F2] px-3 py-2"
                          >
                            <span className="min-w-0 truncate">
                              v{version.versionNumber} · {version.originalFilename}
                              {version.isCurrent ? ' · Current' : ''}
                            </span>
                            <span className="shrink-0 capitalize text-[#77716B]">{version.status}</span>
                          </li>
                        ))}
                        {documentVersions.length === 0 && (
                          <li className="text-[#77716B]">No versions found.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#E8DCD1] flex justify-end">
                    <button
                      type="button"
                      onClick={() => setInspectingDoc(null)}
                      className="px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* 7. Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(docToDelete)}
        title="Delete Document"
        itemName={docToDelete?.name}
        description="This document and its vector embeddings will be removed from the knowledge base."
        confirmLabel="Delete"
        onCancel={() => setDocToDelete(null)}
        onConfirm={() => {
          if (docToDelete) {
            handleDelete(docToDelete);
            setDocToDelete(null);
          }
        }}
      />
    </>
  );
}