import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Users,
  FileText,
  Edit2,
  Trash2,
  X,
  Check,
  Calendar,
  Inbox
} from 'lucide-react';
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

export default function FoldersPage() {
  // Shuruat mein bilkul empty array (Zero mock data - backend se aayega ya user banayega)
  const [folders, setFolders] = useState([]);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'Restricted',
    selectedMembers: []
  });

  const availableOrgMembers = [
    'Jiya Sharma',
    'Khushi Verma',
    'Sakshi Rana',
    'Sanjay Bhakhar',
    'Ankit Singh'
  ];

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      visibility: 'Restricted',
      selectedMembers: []
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description,
      visibility: folder.visibility,
      selectedMembers: [...folder.members]
    });
  };

  // Toggle Member Checkbox
  const toggleMemberSelection = (memberName) => {
    setFormData((prev) => {
      const exists = prev.selectedMembers.includes(memberName);
      return {
        ...prev,
        selectedMembers: exists
          ? prev.selectedMembers.filter((m) => m !== memberName)
          : [...prev.selectedMembers, memberName]
      };
    });
  };

  // Submit Create or Edit
  const handleSubmitFolder = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Folder name is required.');
      return;
    }

    if (editingFolder) {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === editingFolder.id
            ? {
                ...f,
                name: formData.name.trim(),
                description: formData.description.trim(),
                visibility: formData.visibility,
                members: formData.selectedMembers
              }
            : f
        )
      );
      toast.success(`Folder "${formData.name}" updated successfully.`);
      setEditingFolder(null);
    } else {
      const newFolder = {
        id: `f-${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim() || 'Custom department repository.',
        visibility: formData.visibility,
        docCount: 0,
        members: formData.selectedMembers,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setFolders((prev) => [newFolder, ...prev]);
      toast.success(`Folder "${formData.name}" created successfully.`);
      setIsCreateModalOpen(false);
    }
  };

  // Delete Folder
  const handleDeleteFolder = (folderId, folderName) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    toast.error(`Folder "${folderName}" deleted.`);
  };

  // Filtered Folders
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-7 pb-10"
    >
      {/* 1. Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] tracking-tight">Folder Management</h2>
          <p className="text-xs sm:text-sm text-[#77716B] mt-1">
            Organize documents by department and control which team members can query them.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Folder</span>
        </button>
      </motion.div>

      {/* 2. Controls Toolbar: Search & View Switcher */}
      <motion.div
        variants={itemVariants}
        className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        {/* Search Input */}
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#77716B] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search folders by name or description..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
          />
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center p-1 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-[#96613F] text-white shadow-sm'
                : 'text-[#77716B] hover:text-[#25211E]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-[#96613F] text-white shadow-sm'
                : 'text-[#77716B] hover:text-[#25211E]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </motion.div>

      {/* 3. Empty State or Folders List */}
      <motion.div variants={itemVariants}>
        {filteredFolders.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-10 sm:p-14 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-3 shadow-inner">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#25211E]">
              {folders.length === 0 ? 'No folders created yet' : 'No matching folders found'}
            </h4>
            <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
              {folders.length === 0
                ? 'Create your first department folder to organize documents and configure access control.'
                : 'Try clearing your search query.'}
            </p>
            {folders.length === 0 && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Folder</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                className="bg-[#FFFFFF] border border-[#E8DCD1] hover:border-[#96613F] rounded-[14px] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] shrink-0 shadow-sm">
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-[#25211E]">{folder.name}</h3>
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#77716B] border border-[#E8DCD1] mt-0.5">
                          {folder.visibility}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(folder)}
                        className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors"
                        title="Edit Folder"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFolder(folder.id, folder.name)}
                        className="p-1.5 rounded-lg text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] transition-colors"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#77716B] mt-3 line-clamp-2 leading-relaxed">
                    {folder.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#F3E8DC] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#96613F] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {folder.docCount} {folder.docCount === 1 ? 'Document' : 'Documents'}
                    </span>
                    <span className="text-[11px] text-[#77716B] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {folder.createdAt}
                    </span>
                  </div>

                  {folder.members && folder.members.length > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#77716B] text-[11px] font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" /> Assigned:
                      </span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {folder.members.map((m) => (
                          <span
                            key={m}
                            title={m}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3E8DC] text-[#4A3023] border border-[#FFFFFF] text-[10px] font-bold shadow-xs"
                          >
                            {m.split(' ').map((n) => n[0]).join('')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[620px]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8DCD1] text-[11px] font-bold text-[#77716B] uppercase tracking-wider">
                    <th className="px-4 py-3">Folder Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Documents</th>
                    <th className="px-4 py-3">Access Level</th>
                    <th className="px-4 py-3">Assigned Members</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCD1]">
                  {filteredFolders.map((folder) => (
                    <tr key={folder.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <FolderKanban className="w-4 h-4 text-[#96613F]" />
                          <span className="font-semibold text-xs sm:text-sm text-[#25211E]">
                            {folder.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#77716B] max-w-xs truncate">
                        {folder.description}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#96613F]">
                        {folder.docCount} docs
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DCD1] text-[#77716B]">
                          {folder.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#77716B]">
                        {folder.members ? folder.members.length : 0} members
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(folder)}
                            className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors"
                            title="Edit Folder"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFolder(folder.id, folder.name)}
                            className="p-1.5 rounded-lg text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] transition-colors"
                            title="Delete Folder"
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
          </div>
        )}
      </motion.div>

      {/* 4. Create / Edit Folder Modal (Fully Responsive) */}
      {(isCreateModalOpen || editingFolder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD1]">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#96613F]" />
                <h3 className="font-bold text-sm sm:text-base text-[#25211E]">
                  {editingFolder ? 'Edit Folder' : 'Create New Folder'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingFolder(null);
                }}
                className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFolder} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#25211E] mb-1">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Legal & Compliance"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#25211E] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what documents will be placed here..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#25211E] mb-1.5">
                  Select Members Who Can Access This Folder:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto bg-[#FAF7F2] p-2.5 rounded-[8px] border border-[#E8DCD1]">
                  {availableOrgMembers.map((member) => {
                    const isChecked = formData.selectedMembers.includes(member);
                    return (
                      <label
                        key={member}
                        onClick={() => toggleMemberSelection(member)}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-[#FFFFFF] cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-[#96613F] border-[#96613F] text-white'
                              : 'bg-white border-[#E8DCD1]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-medium text-[#25211E]">{member}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DCD1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingFolder(null);
                  }}
                  className="px-3.5 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white font-semibold transition-all duration-150 shadow-sm active:scale-95"
                >
                  {editingFolder ? 'Save Changes' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}