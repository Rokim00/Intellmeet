import React from 'react';
import { Settings as SettingsIcon, User, Shield, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { maskEmail } from '@/utils/privacy';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const maskedEmail = maskEmail(user?.userEmail || 'arlo@solution.com');

  return (
    <div className="min-h-screen w-full bg-[#0c0c0e] text-white p-6 lg:p-8 space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <SettingsIcon className="text-emerald-400" size={24} />
          <span>Settings</span>
        </h1>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        {/* Profile Info */}
        <div className="rounded-lg border border-zinc-800/80 bg-[#121214] p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
            <User size={18} className="text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Profile Details</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-500 font-medium block mb-1">User Name</label>
              <div className="p-2.5 bg-[#161618] border border-zinc-800 rounded-sm font-semibold text-white">
                {user?.userName || 'arlo'}
              </div>
            </div>
            <div>
              <label className="text-zinc-500 font-medium block mb-1">Masked Email</label>
              <div className="p-2.5 bg-[#161618] border border-zinc-800 rounded-sm font-mono text-zinc-300">
                {maskedEmail}
              </div>
            </div>
            <div>
              <label className="text-zinc-500 font-medium block mb-1">Assigned Role</label>
              <div className="p-2.5 bg-[#161618] border border-zinc-800 rounded-sm text-emerald-400 font-semibold flex items-center gap-1.5">
                <Shield size={12} />
                {user?.userRole || 'SuperAdmin'}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="rounded-lg border border-zinc-800/80 bg-[#121214] p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
            <Key size={18} className="text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Security & API Keys</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#161618] border border-zinc-800 rounded-sm">
              <div>
                <div className="font-semibold text-white">Two-Factor Auth</div>
                <div className="text-[11px] text-zinc-400">Enabled for SuperAdmin session</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#161618] border border-zinc-800 rounded-sm">
              <div>
                <div className="font-semibold text-white">Session Security</div>
                <div className="text-[11px] text-zinc-400">JWT Token with HTTP-only fallback</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
