export const ADMIN_EMAILS = ['baron@dossx.com'];

export function isAdminEmail(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
