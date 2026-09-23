import React, { useState } from 'react';
import { LogOut, Copy, Check, Shield, User as UserIcon } from 'lucide-react';
import { IntellMeetLogo } from '@/components/ui/IntellMeetLogo';
import { useAuth } from '@/context/AuthContext';

interface DashboardHeaderProps {
  inviteCode?: string;
  orgName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  inviteCode = 'ACME-4821',
  orgName = 'Acme Corp',
}) => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0c0c0e]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Brand Mark & Org Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <IntellMeetLogo size={26} color="#ffffff" />
            <span className="text-base font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              IntellMeet
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">
            <span className="font-medium text-zinc-300">{orgName}</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-emerald-400 font-semibold">{inviteCode}</span>
            <button
              onClick={handleCopyCode}
              title="Copy Org Invite Code"
              className="ml-1 text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Right User & Controls */}
        <div className="flex items-center gap-3">
          {/* Invite Code Quick Badge (Mobile) */}
          <button
            onClick={handleCopyCode}
            className="sm:hidden flex items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-emerald-400"
          >
            <span>{inviteCode}</span>
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 rounded-sm border border-zinc-800/80 bg-zinc-900/40 px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              {user?.userName ? user.userName.charAt(0).toUpperCase() : <UserIcon size={14} />}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">
                {user?.userName || 'Developer'}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Shield size={10} className="text-emerald-400" />
                {user?.userRole || 'Admin'}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log Out"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
