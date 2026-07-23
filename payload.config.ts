import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';

import { Benchmarks } from './cms/collections/Benchmarks';
import { Datasets } from './cms/collections/Datasets';
import { Software } from './cms/collections/Software';
import { Users } from './cms/collections/Users';
import {
  Projects,
  Publications,
  ResearchAreas,
  Researchers,
} from './cms/collections/research';

const serverURL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gslhub.com').replace(/\/+$/, '');
const trustedOrigins = Array.from(
  new Set([serverURL, 'https://gslhub.com', 'https://www.gslhub.com']),
);

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
    Benchmarks,
    Publications,
    Software,
    Datasets,
  ],
  cookiePrefix: 'gslhub',
  cors: trustedOrigins,
  csrf: trustedOrigins,
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
