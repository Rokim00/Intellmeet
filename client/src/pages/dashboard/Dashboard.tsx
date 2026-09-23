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
    name: 'Organization',
    inviteCode: 'ARLO-8T966X',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgRes, membersRes] = await Promise.allSettled([
          getMyOrganization(),
          getOrganizationMembers(),
        ]);

        if (!active) return;

        if (orgRes.status === 'fulfilled' && orgRes.value.data?.data) {
          const org = orgRes.value.data.data;
          setOrgInfo({
            name: org.organizationName || org.name || 'Organization',
            inviteCode: org.inviteCode || 'ARLO-8T966X',
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
      } finally {
        if (active) setLoading(false);
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
    (m: any) => (m.role || m.userRole) === 'SuperAdmin' || (m.role || m.userRole) === 'Admin'
  ).length;
  const pendingMembers = members.filter(
    (m: any) => (m.status || m.userStatus) === 'Pending'
  ).length;
  const suspendedMembers = members.filter(
    (m: any) => (m.status || m.userStatus) === 'Suspended'
  ).length;

  return (
    <div className="min-h-screen w-full bg-[#0c0c0e] text-white font-['Plus_Jakarta_Sans'] p-6 lg:p-8 space-y-6">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-md border border-zinc-800/80 bg-[#121214] p-4 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-medium text-zinc-400">Total Members</p>
            <p className="text-2xl font-bold text-white mt-1">{totalMembers}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users size={20} />
          </div>
        </div>

        <div className="rounded-md border border-zinc-800/80 bg-[#121214] p-4 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-medium text-zinc-400">Admins & Owners</p>
            <p className="text-2xl font-bold text-white mt-1">{activeAdmins}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="rounded-md border border-zinc-800/80 bg-[#121214] p-4 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-medium text-zinc-400">Pending Approvals</p>
            <p className="text-2xl font-bold text-white mt-1">{pendingMembers}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={20} />
          </div>
        </div>

        <div className="rounded-md border border-zinc-800/80 bg-[#121214] p-4 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs font-medium text-zinc-400">Suspended Accounts</p>
            <p className="text-2xl font-bold text-white mt-1">{suspendedMembers}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
            <UserX size={20} />
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
