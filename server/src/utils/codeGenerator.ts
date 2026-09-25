import crypto from 'crypto';

// Non-ambiguous character pool (excludes 0, O, 1, I, L to prevent user confusion)
const CHAR_POOL = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a cryptographically secure, hard-shuffled random string of specified length.
 * Hard to decode, guess, or brute-force.
 */
export const generateHardShuffledCode = (length = 6): string => {
  const randomBytes = crypto.randomBytes(length * 2);
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % CHAR_POOL.length;
    result += CHAR_POOL[randomIndex];
  }

  return result;
};

/**
 * Format helper to clean and normalize prefixes (uppercase alphanumeric only)
 */
const cleanPrefix = (prefix: string, maxLen = 4, fallback = 'INTEL'): string => {
  const cleaned = (prefix || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, maxLen);
  return cleaned.length > 0 ? cleaned : fallback;
};

/**
 * 1. Organization Invite Code Generator
 * Format: [ORG_PREFIX]-[HARD_SHUFFLED_CODE] (e.g., ACME-K9X3P7)
 */
export const generateOrgInviteCode = (orgSlugOrName: string): string => {
  const prefix = cleanPrefix(orgSlugOrName, 4, 'ORG');
  const shuffle = generateHardShuffledCode(6);
  return `${prefix}-${shuffle}`;
};

/**
 * 2. Project Code Generator
 * Format: [ORG_PREFIX]-[PROJ_PREFIX]-[HARD_SHUFFLED_CODE] (e.g., ACME-MOB2-8K3N9Q)
 */
export const generateProjectCode = (orgSlugOrName: string, projectName: string): string => {
  const orgPrefix = cleanPrefix(orgSlugOrName, 4, 'ORG');
  const projPrefix = cleanPrefix(projectName, 4, 'PROJ');
  const shuffle = generateHardShuffledCode(6);
  return `${orgPrefix}-${projPrefix}-${shuffle}`;
};

/**
 * 3. Meeting / Session Code Generator
 * Format: [ORG_PREFIX]-[PROJ_PREFIX]-[HARD_SHUFFLED_CODE] (e.g., ACME-MOB2-X9K4P7)
 */
export const generateSessionCode = (orgSlugOrName: string, projectName?: string): string => {
  const orgPrefix = cleanPrefix(orgSlugOrName, 4, 'ORG');
  const projPrefix = projectName ? cleanPrefix(projectName, 4, 'MEET') : 'MEET';
  const shuffle = generateHardShuffledCode(6);
  return `${orgPrefix}-${projPrefix}-${shuffle}`;
};
