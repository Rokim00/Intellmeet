import React, { createContext, useContext, useCallback, useMemo } from 'react';
import type { Member } from '@/types/member.types';
import type { OrganizationSummary } from '@/api/auth/auth.types';
import { getOrganizationMembers } from '@/api/organization/organization.api';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@/hooks/useApi';
import { queryKeys } from '@/api/queryClient';

interface OrgInfo {
  name: string;
  inviteCode: string;
}

interface OrganizationContextValue {
  org: OrgInfo;
  members: Member[];
  loading: boolean;
  refresh: () => Promise<void>;
  replaceMember: (updated: Member) => void;
  removeMember: (id: string) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

const EMPTY_ORG: OrgInfo = { name: '', inviteCode: '' };

/** `/auth/me` already returns the populated organization, so it is reused here
 *  instead of calling `/organizations/me` for the same fields. */
const toOrgInfo = (organizationId: unknown): OrgInfo => {
  if (!organizationId || typeof organizationId !== 'object') return EMPTY_ORG;

  const org = organizationId as Partial<OrganizationSummary>;
  return {
    name: org.organizationName ?? '',
    inviteCode: org.inviteCode ?? '',
  };
};

/**
 * Organization details and its member roster, shared by the sidebar invite-code
 * modal and the dashboard so they are fetched once per session, not per mount.
 */
export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const membersQuery = useQuery<Member[]>(
    queryKeys.organization.members,
    () => getOrganizationMembers(),
    { enabled: isAuthenticated, list: true }
  );

  const { refetch: refetchMembers, data: members } = membersQuery;

  const refresh = useCallback(async () => {
    await refetchMembers();
  }, [refetchMembers]);

  // Members are server-authoritative, so a change re-reads the list rather
  // than patching local state that may already be out of date.
  const replaceMember = useCallback(() => {
    void refetchMembers();
  }, [refetchMembers]);

  const removeMember = useCallback(() => {
    void refetchMembers();
  }, [refetchMembers]);

  const value = useMemo(
    () => ({
      org: toOrgInfo(user?.organizationId),
      members: members ?? [],
      loading: membersQuery.loading,
      refresh,
      replaceMember,
      removeMember,
    }),
    [user?.organizationId, members, membersQuery.loading, refresh, replaceMember, removeMember]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganization = (): OrganizationContextValue => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used within an OrganizationProvider');
  return ctx;
};

