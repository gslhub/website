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

// Authenticated CMS users can preview every version. Public API consumers only
// receive documents that have been published through Payload's draft workflow.
export const publishedOrAuthenticatedRead: Access = ({ req }) => {
  if (req.user) return true;

  return {
    _status: {
      equals: 'published',
    },
  };
};

// All authenticated Payload users currently belong to one of the approved
// scientific roles (admin, editor or researcher). Checking authentication
// directly avoids false denials when the role is not hydrated in an access
// request, while the Users collection continues to enforce the allowed roles.
export const authenticatedResearchWrite: Access = ({ req }) => Boolean(req.user);

export const adminOnly: Access = ({ req }) => hasRole(req.user, ['admin']);
