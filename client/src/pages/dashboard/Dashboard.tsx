import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Clock, UserX } from 'lucide-react';
import { MembersTable } from '@/components/dashboard/MembersTable';
import type { Member } from '@/types/member.types';
import {
  getOrganizationMembers,
  getMyOrganization,
} from '@/api/organization/organization.api';

export const Dashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [orgInfo, setOrgInfo] = useState<{ name: string; inviteCode: string }>({
    name: '',
    inviteCode: '',
  });
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [orgRes, membersRes] = await Promise.allSettled([
          getMyOrganization(),
          getOrganizationMembers(),
        ]);

        if (!active) return;

        if (orgRes.status === 'fulfilled' && orgRes.value.data?.data) {
          const org = orgRes.value.data.data;
          setOrgInfo({
            name: org.organizationName || org.name || '',
            inviteCode: org.inviteCode || '',
          });
        }

        if (
          membersRes.status === 'fulfilled' &&
          Array.isArray(membersRes.value.data?.data)
        ) {
          setMembers(membersRes.value.data.data);
        }
      } catch (err) {
        console.warn('Backend endpoint unavailable:', err);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateMember = (updated: Member) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const totalMembers = members.length;
  const activeAdmins = members.filter(
    (m) => m.role === 'SuperAdmin' || m.role === 'Admin'
  ).length;
  const pendingMembers = members.filter((m) => m.status === 'Pending').length;
  const suspendedMembers = members.filter((m) => m.status === 'Suspended').length;

  return (
    <div className="w-full bg-background text-foreground p-6 lg:p-8 space-y-6">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-md border border-border/80 bg-card/90 dark:bg-card/80 backdrop-blur-md p-5 flex items-center justify-between shadow-xs hover:border-emerald-500/30 transition-all duration-200 group">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Members</p>
            <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{totalMembers}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <Users size={19} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-md border border-border/80 bg-card/90 dark:bg-card/80 backdrop-blur-md p-5 flex items-center justify-between shadow-xs hover:border-purple-500/30 transition-all duration-200 group">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Admins & Owners</p>
            <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{activeAdmins}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-xs">
            <ShieldCheck size={19} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-md border border-border/80 bg-card/90 dark:bg-card/80 backdrop-blur-md p-5 flex items-center justify-between shadow-xs hover:border-amber-500/30 transition-all duration-200 group">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Approvals</p>
            <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{pendingMembers}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
            <Clock size={19} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-md border border-border/80 bg-card/90 dark:bg-card/80 backdrop-blur-md p-5 flex items-center justify-between shadow-xs hover:border-red-500/30 transition-all duration-200 group">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Suspended Accounts</p>
            <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{suspendedMembers}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-xs">
            <UserX size={19} />
          </div>
        </div>
      </div>

      {/* Main Members Table with TanStack Table */}
      <MembersTable
        initialMembers={members}
        inviteCode={orgInfo.inviteCode}
        onUpdateMember={handleUpdateMember}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
};
