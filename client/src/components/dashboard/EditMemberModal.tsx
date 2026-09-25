import React, { useState } from 'react';
import { User, Shield, CheckCircle, X } from 'lucide-react';
import type { Member, MemberRole, MemberStatus } from '@/types/member.types';

interface EditMemberModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onSave: (updatedMember: Member) => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onSave,
}) => {
  const [role, setRole] = useState<MemberRole>(member?.role ?? 'Member');
  const [status, setStatus] = useState<MemberStatus>(member?.status ?? 'Active');

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...member,
      role,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121214] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Manage Member</h3>
              <p className="text-xs text-zinc-400">{member.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm text-zinc-400 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Member Name */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              Member Name
            </label>
            <div className="h-10 w-full rounded-sm border border-zinc-800 bg-zinc-900/60 px-3.5 flex items-center text-sm font-medium text-zinc-200">
              {member.name}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <div className="relative">
              <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
                className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161616] pl-10 pr-3.5 text-sm text-zinc-100 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
              >
                <option value="SuperAdmin">SuperAdmin</option>
                <option value="Admin">Admin</option>
                <option value="Host">Host</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              Account Status
            </label>
            <div className="relative">
              <CheckCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="h-10 w-full rounded-sm border border-zinc-800 bg-[#161616] pl-10 pr-3.5 text-sm text-zinc-100 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-sm text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
