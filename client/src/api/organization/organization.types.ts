export interface OrgVerifyResponse {
  valid: boolean;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  location?: string;
}
