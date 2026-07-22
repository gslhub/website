import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { Users } from './cms/collections/Users';
import {
  Datasets,
  Projects,
  Publications,
  ResearchAreas,
  Researchers,
  Software,
} from './cms/collections/research';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const serverURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  bin: [
    {
      key: 'bootstrap',
      scriptPath: path.resolve(dirname, 'cms/scripts/bootstrap.ts'),
    },
  ],
  collections: [
    Users,
    ResearchAreas,
    Researchers,
    Projects,
    Publications,
    Software,
    Datasets,
  ],
  cors: [serverURL],
  csrf: [serverURL],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 5,
    },
  }),
  editor: lexicalEditor(),
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
