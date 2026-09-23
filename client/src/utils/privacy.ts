/**
 * Utility to partially mask user email addresses for privacy.
 * Example: "arlo@solution.com" -> "ar***@solution.com"
 * Example: "john.doe@domain.com" -> "jo***@domain.com"
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) {
    return 'us***@intellmeet.com';
  }

  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username}***@${domain}`;
  }

  const visiblePrefix = username.substring(0, 2);
  return `${visiblePrefix}***@${domain}`;
}
