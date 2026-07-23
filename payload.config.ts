import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';

import { Users } from './cms/collections/Users';
import {
  Datasets,
  Projects,
  Publications,
  ResearchAreas,
  Researchers,
  Software,
} from './cms/collections/research';

const serverURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gslhub.com';

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      logout: {
        Button: '/components/admin/LogoutButton',
      },
    },
  },
  collections: [
    Users,
    ResearchAreas,
    Researchers,
    Projects,
    Publications,
    Software,
    Datasets,
  ],
  cookiePrefix: 'gslhub',
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
    connectOptions: {
      dbName: 'gslhub',
      family: 4,
    },
  }),
  editor: lexicalEditor(),
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Español', code: 'es' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,
});
