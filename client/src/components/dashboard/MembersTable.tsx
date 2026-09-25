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
  ChevronDown,
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
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                {initials}
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm leading-snug">
                  {displayName}
                </div>
                <div className="text-xs text-muted-foreground font-normal">{member.email || 'No email'}</div>
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
              'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 shadow-xs',
            Admin: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-xs',
            Host: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 shadow-xs',
            Member: 'bg-secondary text-secondary-foreground border-border shadow-xs',
          };

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${roleBadgeStyles[role]}`}
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
            Active: { dot: 'bg-emerald-500 dark:bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-400 font-semibold' },
            Pending: { dot: 'bg-amber-500 dark:bg-amber-400', text: 'text-amber-700 dark:text-amber-400 font-semibold' },
            Suspended: { dot: 'bg-red-500 dark:bg-red-400', text: 'text-red-700 dark:text-red-400 font-semibold' },
          };

          const style = statusStyles[status];

          return (
            <span className={`inline-flex items-center gap-1.5 text-xs ${style.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot} animate-pulse`} />
              {status}
            </span>
          );
        },
      }),

      columnHelper.accessor('joinedAt', {
        header: 'Joined Date',
        cell: (info) => (
          <span className="text-xs text-muted-foreground font-mono">
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
                className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setDeletingMember(member)}
                title="Remove Member"
                className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
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
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-md border border-border/80 bg-card pl-10 pr-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none h-10 rounded-md border border-border/80 bg-card pl-8 pr-10 text-xs font-medium text-foreground focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
            >
              <option value="ALL">All Roles</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Admin">Admin</option>
              <option value="Host">Host</option>
              <option value="Member">Member</option>
            </select>
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-2 pointer-events-none border-l border-emerald-500/30">
              <ChevronDown size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none h-10 rounded-md border border-border/80 bg-card px-3 pr-10 text-xs font-medium text-foreground focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-2 pointer-events-none border-l border-emerald-500/30">
              <ChevronDown size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-md border border-border/80 bg-card/90 dark:bg-card/80 backdrop-blur-md shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/60">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-5 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/80">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-emerald-500/[0.03] dark:hover:bg-emerald-500/[0.05] transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-10 text-center text-xs text-muted-foreground">
                    No organization members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/80 px-5 py-3 text-xs text-muted-foreground bg-muted/20">
          <div className="flex items-center gap-2">
            <span>
              Showing Page <strong className="text-foreground font-semibold">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
              <strong className="text-foreground font-semibold">{table.getPageCount() || 1}</strong> ({filteredData.length} total members)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Rows Per Page */}
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-7.5 rounded-sm border border-border bg-card px-2 text-xs text-foreground cursor-pointer shadow-xs"
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
                className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary hover:border-emerald-500/30 transition-all cursor-pointer shadow-xs"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary hover:border-emerald-500/30 transition-all cursor-pointer shadow-xs"
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
