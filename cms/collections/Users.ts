import type { Access, CollectionConfig } from 'payload';

type AuthenticatedUser = {
  id?: number | string;
  role?: string;
};

const isAdministrator: Access = ({ req }) =>
  (req.user as AuthenticatedUser | null)?.role === 'admin';

const createFirstUserOrAdministrator: Access = async ({ req }) => {
  if ((req.user as AuthenticatedUser | null)?.role === 'admin') {
    return true;
  }

  const users = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  });

  return users.totalDocs === 0;
};

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: createFirstUserOrAdministrator,
    read: isAdministrator,
    update: isAdministrator,
    delete: isAdministrator,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') {
          return data;
        }

        const users = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
        });

        if (users.totalDocs === 0) {
          return { ...data, role: 'admin' };
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Researcher', value: 'researcher' },
      ],
    },
  ],
};
