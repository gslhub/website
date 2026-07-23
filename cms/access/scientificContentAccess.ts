import type { Access } from 'payload';

type UserWithRole = {
  role?: unknown;
};

const hasRole = (user: unknown, allowedRoles: string[]) => {
  if (!user || typeof user !== 'object') return false;

  const role = (user as UserWithRole).role;

  return typeof role === 'string' && allowedRoles.includes(role);
};

export const publicRead: Access = () => true;

export const authenticatedResearchWrite: Access = ({ req }) =>
  hasRole(req.user, ['admin', 'editor', 'researcher']);

export const adminOnly: Access = ({ req }) => hasRole(req.user, ['admin']);
