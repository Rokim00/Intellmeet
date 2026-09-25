import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Member } from '@/types/member.types';

interface DeleteMemberModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onConfirm: (memberId: string) => void;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !member) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-lg border border-red-500/30 bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Remove Member</h3>
              <p className="text-xs text-muted-foreground">Confirm action</p>
            </div>
          </div>
        </div>

        <div className="py-4">
          <p className="text-sm text-foreground">
            Are you sure you want to remove <strong className="text-foreground font-semibold">{member.name}</strong> ({member.email}) from the organization?
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This member will lose access to organization meetings, projects, and resources. They can re-join later using a valid invite code.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-md text-xs font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(member.id);
              onClose();
            }}
            className="h-9 px-4 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Remove Member
          </button>
        </div>
      </div>
    </div>
  );
};
