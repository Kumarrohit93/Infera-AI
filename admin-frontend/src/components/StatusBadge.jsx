import React from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Clock,
  AlertCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const normalized = (status || '').toLowerCase();

  // Status mapping: background, text, border aur matching icon
  const styles = {
    // 1. Document Processing Statuses
    completed: {
      bg: 'bg-[#EEF5F0] text-[#2B6141] border-[#CBE3D3]',
      icon: CheckCircle2,
      spin: false
    },
    processing: {
      bg: 'bg-[#F3E8DC] text-[#96613F] border-[#E2CEB9]',
      icon: RefreshCw,
      spin: true
    },
    pending: {
      bg: 'bg-[#FBF5E8] text-[#9A6B26] border-[#EBDDCA]',
      icon: Clock,
      spin: false
    },
    failed: {
      bg: 'bg-[#FDF0EF] text-[#A83833] border-[#F3C9C6]',
      icon: AlertCircle,
      spin: false
    },

    // 2. Team Member Statuses & Roles
    active: {
      bg: 'bg-[#EEF5F0] text-[#2B6141] border-[#CBE3D3]',
      icon: UserCheck,
      spin: false
    },
    invited: {
      bg: 'bg-[#FBF5E8] text-[#9A6B26] border-[#EBDDCA]',
      icon: Clock,
      spin: false
    },
    admin: {
      bg: 'bg-[#F3E8DC] text-[#4A3023] border-[#E2CEB9]',
      icon: ShieldCheck,
      spin: false
    },
    member: {
      bg: 'bg-[#FAF7F2] text-[#77716B] border-[#E8DCD1]',
      icon: null,
      spin: false
    },

    // 3. Feedback Statuses
    helpful: {
      bg: 'bg-[#EEF5F0] text-[#2B6141] border-[#CBE3D3]',
      icon: CheckCircle2,
      spin: false
    },
    'not helpful': {
      bg: 'bg-[#FDF0EF] text-[#A83833] border-[#F3C9C6]',
      icon: AlertCircle,
      spin: false
    }
  };

  // Fallback default agar koi anjaan status pass ho
  const current = styles[normalized] || {
    bg: 'bg-[#FAF7F2] text-[#77716B] border-[#E8DCD1]',
    icon: null,
    spin: false
  };

  const IconComponent = current.icon;
  const paddingClass = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${paddingClass} ${current.bg}`}
    >
      {IconComponent && (
        <IconComponent
          className={`w-3.5 h-3.5 shrink-0 ${current.spin ? 'animate-spin' : ''}`}
        />
      )}
      <span>{status}</span>
    </span>
  );
}