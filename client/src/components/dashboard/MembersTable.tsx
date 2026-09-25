import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import type { Member, MemberRole, MemberStatus } from '@/types/member.types';
import { EditMemberModal } from './EditMemberModal';
import { DeleteMemberModal } from './DeleteMemberModal';

interface MembersTableProps {
  initialMembers: Member[];
  inviteCode?: string;
  onUpdateMember: (updated: Member) => void;
  onRemoveMember: (id: string) => void;
}

const columnHelper = createColumnHelper<Member>();

export const MembersTable: React.FC<MembersTableProps> = ({
  initialMembers,
  onUpdateMember,
  onRemoveMember,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  // Active filter logic & normalization for any backend format (User or Member)
  const filteredData: Member[] = useMemo(() => {
    return initialMembers
      .map((m: Member): Member => ({
        id: m.id || m._id || m.userId || Math.random().toString(),
        name: m.name || m.userName || m.userEmail || 'Team Member',
        email: m.email || m.userEmail || '',
        role: (m.role || m.userRole || 'Member') as MemberRole,
        status: (m.status || 'Active') as MemberStatus,
        joinedAt: m.joinedAt
          ? String(m.joinedAt).split('T')[0]
          : m.createdAt
            ? String(m.createdAt).split('T')[0]
            : '2026-03-01',
        avatarUrl: m.avatarUrl || '',
      }))
      .filter((member) => {
        const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
        const matchesSearch =
          !globalFilter ||
          (member.name && member.name.toLowerCase().includes(globalFilter.toLowerCase())) ||
          (member.email && member.email.toLowerCase().includes(globalFilter.toLowerCase()));
        return matchesRole && matchesStatus && matchesSearch;
      });
  }, [initialMembers, roleFilter, statusFilter, globalFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Member',
        cell: (info) => {
          const member = info.row.original;
          const displayName = member.name || member.email || 'Member';
          const initials =
            displayName
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase() || 'M';

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                {initials}
              </div>
              <div>
                <div className="font-semibold text-white text-sm leading-snug">
                  {displayName}
                </div>
                <div className="text-xs text-zinc-400 font-normal">{member.email || 'No email'}</div>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => {
          const rawRole = info.getValue() as MemberRole;
          const role: MemberRole = ['SuperAdmin', 'Admin', 'Host', 'Member'].includes(rawRole)
            ? rawRole
            : 'Member';

          const roleBadgeStyles: Record<MemberRole, string> = {
            SuperAdmin:
              'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-xs',
            Admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            Host: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            Member: 'bg-zinc-800 text-zinc-300 border-zinc-700/80',
          };

          return (
            <span
              className={`inline-flex items-center gap-1.25 px-2.5 py-1 rounded-sm text-xs font-medium border ${roleBadgeStyles[role]}`}
            >
              <Shield size={12} />
              {role}
            </span>
          );
        },
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const rawStatus = info.getValue() as MemberStatus;
          const status: MemberStatus = ['Active', 'Pending', 'Suspended'].includes(rawStatus)
            ? rawStatus
            : 'Active';

          const statusStyles: Record<MemberStatus, { dot: string; text: string }> = {
            Active: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
            Pending: { dot: 'bg-amber-400', text: 'text-amber-400' },
            Suspended: { dot: 'bg-red-400', text: 'text-red-400' },
          };

          const style = statusStyles[status];

          return (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot} animate-pulse`} />
              {status}
            </span>
          );
        },
      }),

      columnHelper.accessor('joinedAt', {
        header: 'Joined Date',
        cell: (info) => (
          <span className="text-xs text-zinc-400 font-mono">
            {info.getValue() || '2026-03-01'}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const member = info.row.original;

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setEditingMember(member)}
                title="Edit Role & Status"
                className="flex h-8 w-8 items-center justify-center rounded-sm text-zinc-400 hover:bg-zinc-800 hover:text-emerald-400 transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setDeletingMember(member)}
                title="Remove Member"
                className="flex h-8 w-8 items-center justify-center rounded-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  // TanStack Table returns stateful functions that cannot be memoized safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name or email..."
            className="h-9.5 w-full rounded-sm border border-zinc-800 bg-[#161616] pl-10 pr-3.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9.5 rounded-sm border border-zinc-800 bg-[#161616] pl-8 pr-3 text-xs text-zinc-300 focus:border-emerald-500/80 transition-colors"
            >
              <option value="ALL">All Roles</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Admin">Admin</option>
              <option value="Host">Host</option>
              <option value="Member">Member</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9.5 rounded-sm border border-zinc-800 bg-[#161616] px-3 text-xs text-zinc-300 focus:border-emerald-500/80 transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-md border border-zinc-800/80 bg-[#121214] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-zinc-800/80 bg-zinc-900/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-800/30 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-xs text-zinc-500">
                    No organization members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/80 px-4 py-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              Showing Page <strong className="text-white">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
              <strong className="text-white">{table.getPageCount() || 1}</strong> ({filteredData.length} total members)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Rows Per Page */}
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-7 rounded-sm border border-zinc-800 bg-[#161616] px-2 text-xs text-zinc-300"
              >
                {[5, 10, 20, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditMemberModal
        key={editingMember?.id}
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={onUpdateMember}
      />

      {/* Delete Confirmation Modal */}
      <DeleteMemberModal
        isOpen={!!deletingMember}
        member={deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={onRemoveMember}
      />
    </div>
  );
};
