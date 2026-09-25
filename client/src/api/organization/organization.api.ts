import client from '../client';
import type { OrgVerifyResponse } from './organization.types';
import type { Member, MemberRole, MemberStatus } from '@/types/member.types';

export const verifyInviteCode = (code: string) =>
  client.get<{ data: OrgVerifyResponse }>(`/organizations/invite/${code}`);

export const getOrganizationMembers = () =>
  client.get<{ data: Member[] }>('/organizations/members');

export const regenerateInviteCode = () =>
  client.post<{ data: { organizationId: string; inviteCode: string; organizationName?: string } }>(
    '/organizations/invite/regenerate'
  );

export const updateMemberRole = (memberId: string, role: MemberRole) =>
  client.patch<{ data: Member }>(`/organizations/members/${memberId}/role`, { role });

export const updateMemberStatus = (memberId: string, status: MemberStatus) =>
  client.patch<{ data: Member }>(`/organizations/members/${memberId}/status`, { status });

export const removeMember = (memberId: string) =>
  client.delete(`/organizations/members/${memberId}`);
