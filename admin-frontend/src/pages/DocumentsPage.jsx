import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Search,
  FileText,
  Trash2,
  Eye,
  Inbox,
  Filter,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

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

export default function DocumentsPage() {
  const fileInputRef = useRef(null);

  // Documents state (Zero mock data - backend se aayega ya user upload karega)
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [targetUploadFolder, setTargetUploadFolder] = useState('HR');

  // Inspect Modal state
  const [inspectingDoc, setInspectingDoc] = useState(null);

  // Simulated File Upload Handler
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDocs = files.map((file, idx) => ({
      id: Date.now() + idx,
      name: file.name,
      folder: targetUploadFolder,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      pages: Math.floor(Math.random() * 40) + 10,
      chunks: Math.floor(Math.random() * 150) + 30
    }));

    setDocuments((prev) => [...newDocs, ...prev]);
    toast.success(`${files.length} document(s) uploaded successfully!`);
    e.target.value = '';
  };

  // Delete Document Handler
  const handleDelete = (docId, docName) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    toast.error(`"${docName}" removed from knowledge base.`);
  };

  // Search & Filter Logic
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolderFilter === 'All' || doc.folder === selectedFolderFilter;
    const matchesStatus = selectedStatusFilter === 'All' || doc.status === selectedStatusFilter;
    return matchesSearch && matchesFolder && matchesStatus;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-7 pb-10"
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
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Documents</span>
        </button>
      </motion.div>

      {/* 2. Drag & Drop Upload Card (Fully Responsive) */}
      <motion.div
        variants={itemVariants}
        className="bg-[#FFFFFF] border-2 border-dashed border-[#E8DCD1] hover:border-[#96613F] rounded-[16px] p-5 sm:p-7 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[12px] bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] shrink-0 shadow-sm">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#25211E]">
                Drag and drop documents here, or click to browse
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
                value={targetUploadFolder}
                onChange={(e) => setTargetUploadFolder(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-semibold text-[#25211E] focus:outline-none focus:border-[#96613F] transition-colors"
              >
                <option value="HR">HR Folder</option>
                <option value="IT">IT Folder</option>
                <option value="Finance">Finance Folder</option>
                <option value="Operations">Operations Folder</option>
                <option value="General">General Folder</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs font-semibold transition-colors text-center active:scale-95"
            >
              Browse Files
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3. Search Bar & Dropdown Filters Toolbar */}
      <motion.div
        variants={itemVariants}
        className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        {/* Search */}
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#77716B]">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filter:</span>
          </div>

          <select
            value={selectedFolderFilter}
            onChange={(e) => setSelectedFolderFilter(e.target.value)}
            className="px-2.5 sm:px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-medium text-[#25211E] focus:outline-none focus:border-[#96613F]"
          >
            <option value="All">All Folders</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="General">General</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 sm:px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-medium text-[#25211E] focus:outline-none focus:border-[#96613F]"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </motion.div>

      {/* 4. Documents Table / Responsive Container */}
      <motion.div
        variants={itemVariants}
        className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
      >
        {filteredDocuments.length === 0 ? (
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
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[8px] bg-[#F3E8DC] text-[#96613F] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm text-[#25211E]">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-[#77716B]">
                            {doc.pages ? `${doc.pages} pages • ` : ''}
                            {doc.chunks ? `${doc.chunks} chunks` : 'Vectorizing'}
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
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectingDoc(doc)}
                          className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors"
                          title="Inspect Chunks"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id, doc.name)}
                          className="p-1.5 rounded-lg text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] transition-colors"
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

      {/* 5. Document Inspection Modal (Fully Responsive) */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-lg w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
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
                className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors"
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
                  Chunk Size: 800 tokens • Overlap: 120 tokens • Model: text-embedding-3-large • Dimensions: 3,072
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#E8DCD1] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] text-xs font-semibold transition-colors active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}