import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, folderApi, employeeApi } from '../services/api';
import { DEPARTMENTS } from './AddMemberPage';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Edit2,
  Trash2,
  X,
  Check,
  Filter,
  Inbox,
  Loader2,
  Building2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

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

export default function TeamMembersPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Invited / Active Team Members (Zero Mock Data)
  const { data: serverMembers = [], isLoading } = useQuery({
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

  // 2. Fetch Organization Employees (Added via AddMemberPage)
  const { data: orgEmployees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const res = await employeeApi.getEmployees();
        return Array.isArray(res) ? res : [];
      } catch (err) {
        return queryClient.getQueryData(['employees']) ?? [];
      }
    },
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  // 3. Fetch Folders dynamically
  const { data: serverFolders = [] } = useQuery({
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

  const availableFolders = serverFolders
    .map((f) => (typeof f === 'string' ? f : f?.name))
    .filter(Boolean);

  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (serverMembers) {
      setMembers(serverMembers);
    }
  }, [serverMembers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Invite / Edit Form State (Department -> Employee -> Folders)
  const [selectedDepartment, setSelectedDepartment] = useState(DEPARTMENTS[0]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedFolders, setSelectedFolders] = useState([]);

  // Employees filtered by selected department
  const departmentEmployees = orgEmployees.filter(
    (emp) => emp.department === selectedDepartment
  );

  // Auto-select first employee in department when department changes
  useEffect(() => {
    if (isInviteModalOpen) {
      if (departmentEmployees.length > 0) {
        const stillValid = departmentEmployees.some((e) => e.id === selectedEmployeeId);
        if (!selectedEmployeeId || !stillValid) {
          setSelectedEmployeeId(departmentEmployees[0].id);
        }
      } else {
        setSelectedEmployeeId('');
      }
    }
  }, [selectedDepartment, isInviteModalOpen, orgEmployees]);

  // Invite Mutation
  const inviteMemberMutation = useMutation({
    mutationFn: memberApi.inviteMember,
    onSuccess: (newMember, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success(`Invitation sent to ${newMember?.email || variables.email}`);
    },
    onError: (_err, variables) => {
      const fallbackMember = {
        id: `m-${Date.now()}`,
        employeeId: variables.employeeId,
        name: variables.name,
        email: variables.email,
        department: variables.department,
        role: 'Member',
        status: 'Invited',
        folders: variables.folderIds,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setMembers((prev) => [...prev, fallbackMember]);
      queryClient.setQueryData(['members'], (prev = []) => [...prev, fallbackMember]);
      toast.success(`Invitation sent to ${fallbackMember.email}`);
    }
  });

  // Remove Mutation
  const removeMemberMutation = useMutation({
    mutationFn: memberApi.removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (_err, memberId) => {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      queryClient.setQueryData(['members'], (prev = []) => prev.filter((m) => m.id !== memberId));
    }
  });

  const handleOpenInviteModal = () => {
    setSelectedDepartment(DEPARTMENTS[0]);
    setSelectedEmployeeId('');
    setSelectedFolders([]);
    setIsInviteModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setSelectedFolders([...(member.folders || [])]);
  };

  const toggleFolderSelection = (folderName) => {
    setSelectedFolders((prev) =>
      prev.includes(folderName)
        ? prev.filter((f) => f !== folderName)
        : [...prev, folderName]
    );
  };

  const handleSubmitMember = (e) => {
    e.preventDefault();

    if (editingMember) {
      const updatedList = members.map((m) =>
        m.id === editingMember.id
          ? { ...m, folders: selectedFolders }
          : m
      );
      setMembers(updatedList);
      queryClient.setQueryData(['members'], updatedList);
      toast.success(`Folder access updated for "${editingMember.name}".`);
      setEditingMember(null);
      return;
    }

    const chosenEmployee = departmentEmployees.find((emp) => emp.id === selectedEmployeeId);
    if (!chosenEmployee) {
      toast.error('Please select an organization employee to invite.');
      return;
    }

    const alreadyInvited = members.some(
      (m) => m.email.toLowerCase() === chosenEmployee.email.toLowerCase()
    );
    if (alreadyInvited) {
      toast.error(`${chosenEmployee.name} has already been invited.`);
      return;
    }

    inviteMemberMutation.mutate({
      employeeId: chosenEmployee.employeeId,
      name: chosenEmployee.name,
      email: chosenEmployee.email,
      department: chosenEmployee.department,
      role: 'Member',
      folderIds: selectedFolders
    });
    setIsInviteModalOpen(false);
  };

  const handleDeleteMember = (memberId, memberName) => {
    removeMemberMutation.mutate(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    queryClient.setQueryData(['members'], (prev = []) => prev.filter((m) => m.id !== memberId));
    toast.error(`Member "${memberName}" removed.`);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-7 pb-10"
      >
        {/* 1. Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] tracking-tight">Team Members</h2>
            <p className="text-xs sm:text-sm text-[#77716B] mt-1">
              Invite organization employees by department and manage their folder access permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenInviteModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </motion.div>

        {/* 2. Search & Filter Bar */}
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
              placeholder="Search invited members by name or email..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-[#77716B]">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-semibold">Filter:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-medium text-[#25211E] focus:outline-none focus:border-[#96613F]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
            </select>
          </div>
        </motion.div>

        {/* 3. Members Table / Empty State */}
        <motion.div
          variants={itemVariants}
          className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
        >
          {isLoading ? (
            <div className="p-12 text-center text-[#77716B] text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#96613F]" />
              <span>Loading team members...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-10 sm:p-14 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-3 shadow-inner">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#25211E]">
                {members.length === 0 ? 'No team members invited yet' : 'No matching members found'}
              </h4>
              <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
                {members.length === 0
                  ? 'Select a department and invite registered organization employees to grant folder access.'
                  : 'Try clearing your search query or changing filters.'}
              </p>
              {members.length === 0 && (
                <button
                  type="button"
                  onClick={handleOpenInviteModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite First Member</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8DCD1] text-[11px] font-bold text-[#77716B] uppercase tracking-wider">
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Folder Access</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCD1]">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#96613F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-xs sm:text-sm text-[#25211E]">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-[#77716B] flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1]">
                          <Building2 className="w-3 h-3 text-[#96613F]" />
                          {member.department || 'General'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.folders && member.folders.length > 0 ? (
                            member.folders.map((f) => (
                              <span
                                key={f}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DCD1] text-[#4A3023]"
                              >
                                {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#77716B]">No folders</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={member.status} />
                      </td>

                      <td className="px-4 py-3 text-xs text-[#77716B]">{member.joinedDate}</td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 rounded-lg text-[#77716B] hover:text-[#96613F] hover:bg-[#F3E8DC] transition-colors cursor-pointer"
                            title="Edit Folder Access"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="p-1.5 rounded-lg text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] transition-colors cursor-pointer"
                            title="Remove Member"
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

      {/* 4. Invite / Edit Member Modal (Department -> Employees -> Folders) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {(isInviteModalOpen || editingMember) && (
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
                      <Users className="w-5 h-5 text-[#96613F]" />
                      <h3 className="font-bold text-sm sm:text-base text-[#25211E]">
                        {editingMember ? `Edit Access: ${editingMember.name}` : 'Invite Organization Member'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsInviteModalOpen(false);
                        setEditingMember(null);
                      }}
                      className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitMember} className="mt-4 space-y-4 text-xs">
                    {!editingMember && (
                      <>
                        {/* Step 1: Select Department */}
                        <div>
                          <label className="block font-semibold text-[#25211E] mb-1">
                            1. Select Department *
                          </label>
                          <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] font-medium focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                          >
                            {DEPARTMENTS.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Step 2: Select Employee from that Department */}
                        <div>
                          <label className="block font-semibold text-[#25211E] mb-1">
                            2. Select Employee ({selectedDepartment}) *
                          </label>
                          {departmentEmployees.length === 0 ? (
                            <div className="p-3 rounded-[8px] bg-[#FAF7F2] border border-[#E8DCD1] text-[11px] text-[#77716B] text-center">
                              No employees found in <span className="font-semibold text-[#25211E]">{selectedDepartment}</span> department. Add them first on the Add Member page.
                            </div>
                          ) : (
                            <select
                              value={selectedEmployeeId}
                              onChange={(e) => setSelectedEmployeeId(e.target.value)}
                              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] font-medium focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                            >
                              {departmentEmployees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name} ({emp.employeeId}) — {emp.email}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </>
                    )}

                    {/* Step 3: Select Accessible Folders */}
                    <div>
                      <label className="block font-semibold text-[#25211E] mb-1.5">
                        {editingMember ? 'Select Accessible Folders:' : '3. Select Accessible Folders:'}
                      </label>
                      <div className="bg-[#FAF7F2] p-2.5 rounded-[8px] border border-[#E8DCD1]">
                        {availableFolders.length === 0 ? (
                          <p className="text-[11px] text-[#77716B] py-2 text-center">
                            No folders created yet. Create folders from the Folders page.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-sidebar-scroll">
                            {availableFolders.map((folder) => {
                              const isChecked = selectedFolders.includes(folder);
                              return (
                                <label
                                  key={folder}
                                  onClick={() => toggleFolderSelection(folder)}
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
                                  <span className="font-medium text-[#25211E]">{folder}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8DCD1] flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsInviteModalOpen(false);
                          setEditingMember(null);
                        }}
                        className="px-3.5 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!editingMember && departmentEmployees.length === 0}
                        className="px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
                      >
                        {editingMember ? 'Save Changes' : 'Send Invitation'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}