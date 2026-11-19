import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { folderApi, memberApi } from '../services/api';
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
  Eye,
  Inbox,
  ShieldCheck
} from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { TableSkeleton, FolderGridSkeleton } from '../components/SkeletonLoader';
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

export default function FoldersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: serverFolders = [], isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['folders'],
    queryFn: folderApi.getFolders,
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (isError) toast.error(error?.message || 'Failed to load folders.');
  }, [isError, error]);

  const { data: orgMembers = [], isError: membersError, error: membersQueryError } = useQuery({
    queryKey: ['members'],
    queryFn: memberApi.getMembers,
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (membersError) toast.error(membersQueryError?.message || 'Failed to load team members.');
  }, [membersError, membersQueryError]);

  const availableOrgMembers = orgMembers
    .filter((member) => member.status === 'Active');

  const folders = serverFolders;

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderToDelete, setFolderToDelete] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'Restricted',
    selectedMembers: []
  });

  // 2. TanStack Mutation: Create Folder (Syncs shared ['folders'] cache)
  const createFolderMutation = useMutation({
    mutationFn: folderApi.createFolder,
    onSuccess: (newFolder) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(`Folder "${newFolder?.name || formData.name}" created successfully.`);
    },
    onError: (err) => toast.error(err?.message || 'Failed to create folder.')
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, data }) => folderApi.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder updated successfully.');
      setEditingFolder(null);
    },
    onError: (err) => toast.error(err?.message || 'Failed to update folder.')
  });

  // 3. TanStack Mutation: Delete Folder (Syncs shared ['folders'] cache)
  const deleteFolderMutation = useMutation({
    mutationFn: folderApi.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete folder.');
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    }
  });

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
      selectedMembers: [...(folder.members || [])]
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
      updateFolderMutation.mutate({
        id: editingFolder.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim(),
          members: formData.selectedMembers
        }
      });
    } else {
      createFolderMutation.mutate({
        name: formData.name.trim(),
        description: formData.description.trim(),
        members: formData.selectedMembers
      });
      setIsCreateModalOpen(false);
    }
  };

  // Delete Folder
  const handleDeleteFolder = (folderId) => {
    deleteFolderMutation.mutate(folderId);
  };

  // Filtered Folders
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-7 pb-12"
      >
        {/* 1. Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] tracking-tight">Folder Management</h2>
            <p className="text-xs sm:text-sm text-[#77716B] mt-1">
              Organize documents by department and configure role-based access control for AI querying.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
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

          <div className="inline-flex items-center p-1 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#96613F] text-white shadow-xs'
                  : 'text-[#77716B] hover:text-[#25211E]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#96613F] text-white shadow-xs'
                  : 'text-[#77716B] hover:text-[#25211E]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>
        </motion.div>

        {/* 3. Empty State, Loading Skeleton, or Folders List */}
        <motion.div variants={itemVariants}>
          {isLoading || (isFetching && folders.length === 0) ? (
            viewMode === 'grid' ? (
              <FolderGridSkeleton cards={6} />
            ) : (
              <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] shadow-sm overflow-hidden">
                <TableSkeleton rows={4} columns={6} />
              </div>
            )
          ) : filteredFolders.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] p-10 sm:p-14 text-center shadow-sm">
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
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Folder</span>
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredFolders.map((folder) => {
                return (
                  <div
                    key={folder.id}
                    className="group bg-[#FFFFFF] border border-[#E8DCD1] hover:border-[#96613F]/60 rounded-[16px] p-5 shadow-sm hover:shadow-[0_12px_28px_-8px_rgba(150,97,63,0.15)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-[12px] bg-[#F3E8DC] border border-[#E8DCD1] group-hover:bg-[#96613F] group-hover:text-white flex items-center justify-center text-[#96613F] shrink-0 shadow-xs transition-colors duration-200">
                            <FolderKanban className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm sm:text-base text-[#25211E] tracking-tight">
                              {folder.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#77716B] border border-[#E8DCD1] mt-0.5">
                              <ShieldCheck className="w-3 h-3 text-[#96613F]" />
                              {folder.visibility}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(folder)}
                            className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors cursor-pointer"
                            title="Edit Folder"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFolderToDelete(folder)}
                            className="p-1.5 rounded-lg text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] transition-colors cursor-pointer"
                            title="Delete Folder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#77716B] mt-3.5 line-clamp-2 leading-relaxed">
                        {folder.description}
                      </p>

                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F3E8DC] space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#96613F] flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {folder.docCount} {folder.docCount === 1 ? 'Document' : 'Documents'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/documents?folder=${encodeURIComponent(folder.name)}`)
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#96613F] hover:text-[#4A3023] hover:bg-[#F3E8DC]/70 px-2 py-1 rounded-[6px] transition-colors cursor-pointer"
                          title={`View documents in ${folder.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>

                      {folder.members && folder.members.length > 0 && (
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[#77716B] text-[11px] font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" /> Access:
                          </span>
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {folder.members.map((memberId) => {
                              const member = orgMembers.find((item) => item.id === memberId);
                              const label = member?.name || member?.email || memberId;
                              return (
                              <span
                                key={memberId}
                                title={label}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3E8DC] hover:bg-[#96613F] hover:text-white transition-all text-[#4A3023] border border-[#FFFFFF] text-[10px] font-bold shadow-xs cursor-default"
                              >
                                {label.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] shadow-sm overflow-hidden">
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
                              onClick={() =>
                                navigate(`/documents?folder=${encodeURIComponent(folder.name)}`)
                              }
                              className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors cursor-pointer"
                              title="View Documents"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(folder)}
                              className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors cursor-pointer"
                              title="Edit Folder"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setFolderToDelete(folder)}
                              className="p-1.5 rounded-lg text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] transition-colors cursor-pointer"
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
      </motion.div>

      {/* 4. Create / Edit Folder Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {(isCreateModalOpen || editingFolder) && (
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
                        {editingFolder ? 'Edit Folder' : 'Create New Folder'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        setEditingFolder(null);
                      }}
                      className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
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
                      <div className="space-y-1.5 max-h-36 overflow-y-auto custom-sidebar-scroll bg-[#FAF7F2] p-2.5 rounded-[8px] border border-[#E8DCD1]">
                        {availableOrgMembers.length === 0 ? (
                          <p className="text-[11px] text-[#77716B] py-3 text-center">
                            No team members available yet. Invite members from Team Members page.
                          </p>
                        ) : (
                          availableOrgMembers.map((member) => {
                            const isChecked = formData.selectedMembers.includes(member.id);
                            return (
                              <label
                                key={member.id}
                                onClick={() => toggleMemberSelection(member.id)}
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
                                <span className="font-medium text-[#25211E]">{member.name || member.email}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8DCD1] flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          setEditingFolder(null);
                        }}
                        className="px-3.5 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
                      >
                        {editingFolder ? 'Save Changes' : 'Create Folder'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* 5. Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(folderToDelete)}
        title="Delete Folder"
        itemName={folderToDelete?.name}
        description="This folder and its access configuration will be permanently removed."
        confirmLabel="Delete"
        onCancel={() => setFolderToDelete(null)}
        onConfirm={() => {
          if (folderToDelete) {
            handleDeleteFolder(folderToDelete.id, folderToDelete.name);
            setFolderToDelete(null);
          }
        }}
      />
    </>
  );
}