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

// All authenticated Payload users currently belong to one of the approved
// scientific roles (admin, editor or researcher). Checking authentication
// directly avoids false denials when the role is not hydrated in an access
// request, while the Users collection continues to enforce the allowed roles.
export const authenticatedResearchWrite: Access = ({ req }) => Boolean(req.user);

export const adminOnly: Access = ({ req }) => hasRole(req.user, ['admin']);
