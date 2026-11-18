import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, departmentApi } from '../services/api';
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  IdCard,
  Building2,
  Trash2,
  X,
  Filter,
  Inbox,
  Eye,
  EyeOff
} from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { TableSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'HR',
  'IT',
  'Finance',
  'Engineering',
  'Operations',
  'Sales',
  'Marketing'
];

const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

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

export default function AddMemberPage() {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getEmployees,
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: serverDepartments = [], isError: departmentsError, error: departmentsQueryError } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.getDepartments,
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });

  React.useEffect(() => {
    if (isError) toast.error(error?.message || 'Failed to load employees.');
  }, [isError, error]);

  React.useEffect(() => {
    if (departmentsError) toast.error(departmentsQueryError?.message || 'Failed to load departments.');
  }, [departmentsError, departmentsQueryError]);

  const departmentOptions =
    serverDepartments.length > 0
      ? serverDepartments.map((d) => (typeof d === 'string' ? d : d?.name)).filter(Boolean)
      : DEPARTMENTS;

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    password: '',
    department: DEPARTMENTS[0]
  });

  // Create Employee Mutation (Real backend error handling - no fake fallback)
  const createEmployeeMutation = useMutation({
    mutationFn: employeeApi.createEmployee,
    onSuccess: (newEmp, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(
        `Employee "${newEmp?.name || variables.name}" added to ${newEmp?.department || variables.department}.`
      );
      setIsAddModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create employee.');
    }
  });

  // Delete Employee Mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: employeeApi.deleteEmployee,
    onSuccess: (_data, empId) => {
      queryClient.setQueryData(['employees'], (prev = []) => prev.filter((e) => e.id !== empId));
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee removed from directory.');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to remove employee.');
    }
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      employeeId: '',
      email: '',
      phone: '',
      password: '',
      department: departmentOptions[0] || DEPARTMENTS[0]
    });
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.employeeId.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password.trim()
    ) {
      toast.error('Please fill all required employee details.');
      return;
    }

    createEmployeeMutation.mutate({
      name: formData.name.trim(),
      employeeId: formData.employeeId.trim().toUpperCase(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      department: formData.department
    });
  };

  const handleDelete = (emp) => {
    deleteEmployeeMutation.mutate(emp.id);
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.email || '').toLowerCase().includes(q) ||
      (emp.employeeId || '').toLowerCase().includes(q);
    const matchesDept =
      deptFilter === 'All' ||
      (emp.department || '').toLowerCase() === deptFilter.toLowerCase();
    return matchesSearch && matchesDept;
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
            <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] tracking-tight">
              Organization Employees
            </h2>
            <p className="text-xs sm:text-sm text-[#77716B] mt-1">
              Add organization employees and assign departments before sending folder invitations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </motion.div>

        {/* 2. Search & Department Filter Bar */}
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
              placeholder="Search by name, email, or employee ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs sm:text-sm text-[#25211E] placeholder-[#77716B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-[#77716B]">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-semibold">Department:</span>
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-xs font-medium text-[#25211E] focus:outline-none focus:border-[#96613F]"
            >
              <option value="All">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* 3. Employees Table / Skeleton / Empty State */}
        <motion.div
          variants={itemVariants}
          className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
        >
          {isLoading || (isFetching && employees.length === 0) ? (
            <TableSkeleton rows={4} columns={6} />
          ) : filteredEmployees.length === 0 ? (
            <div className="p-10 sm:p-14 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] mx-auto mb-3 shadow-inner">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#25211E]">
                {employees.length === 0 ? 'No organization employees added yet' : 'No matching employees found'}
              </h4>
              <p className="text-xs text-[#77716B] max-w-sm mx-auto mt-1 leading-relaxed">
                {employees.length === 0
                  ? 'Add employees with their ID, contact details, and department so they can be invited to folders.'
                  : 'Try clearing your search query or changing the department filter.'}
              </p>
              {employees.length === 0 && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add First Employee</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8DCD1] text-[11px] font-bold text-[#77716B] uppercase tracking-wider">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Added Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCD1]">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#96613F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {(emp.name || 'U')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-xs sm:text-sm text-[#25211E]">
                              {emp.name}
                            </p>
                            <p className="text-[11px] text-[#77716B] flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {emp.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs font-semibold text-[#25211E]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DCD1]">
                          <IdCard className="w-3 h-3 text-[#96613F]" />
                          {emp.employeeId}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-[#77716B]">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {emp.phone}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1]">
                          <Building2 className="w-3 h-3 text-[#96613F]" />
                          {emp.department}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-[#77716B]">{formatDate(emp.createdAt)}</td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setEmployeeToDelete(emp)}
                          className="p-1.5 rounded-lg text-[#77716B] hover:text-[#A83833] hover:bg-[#FDF0EF] transition-colors cursor-pointer"
                          title="Remove Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* 4. Add Employee Modal (Portal to document.body) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isAddModalOpen && (
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
                      <UserPlus className="w-5 h-5 text-[#96613F]" />
                      <h3 className="font-bold text-sm sm:text-base text-[#25211E]">
                        Add Organization Employee
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#25211E] mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Rohan Kapoor"
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#25211E] mb-1">Employee ID *</label>
                        <input
                          type="text"
                          required
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          placeholder="e.g. EMP-101"
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#25211E] mb-1">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. rohan.kapoor@infera.ai"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#25211E] mb-1">Phone *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#25211E] mb-1">Department *</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] font-medium focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                        >
                          {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#25211E] mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Minimum 8 characters"
                          className="w-full pl-3 pr-9 py-2 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[8px] text-[#25211E] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#96613F] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#77716B] hover:text-[#25211E] cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8DCD1] flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-3.5 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createEmployeeMutation.isPending}
                        className="px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
                      >
                        {createEmployeeMutation.isPending ? 'Creating...' : 'Create Employee'}
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
        isOpen={Boolean(employeeToDelete)}
        title="Remove Employee"
        itemName={employeeToDelete?.name}
        description="This employee will be removed from the organization directory."
        confirmLabel="Remove"
        onCancel={() => setEmployeeToDelete(null)}
        onConfirm={() => {
          if (employeeToDelete) {
            handleDelete(employeeToDelete);
            setEmployeeToDelete(null);
          }
        }}
      />
    </>
  );
}