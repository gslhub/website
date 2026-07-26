import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';

import { AISystems } from './cms/collections/AISystemsWithIntegrity';
import { Benchmarks } from './cms/collections/BenchmarksWithIntegrity';
import { Citations } from './cms/collections/CitationsWithIntegrity';
import { Datasets } from './cms/collections/Datasets';
import { Evidence } from './cms/collections/EvidenceWithExecutionContext';
import { Experiments } from './cms/collections/ExperimentsWithIntegrity';
import { Metrics } from './cms/collections/MetricsWithIntegrity';
import { Observations } from './cms/collections/ObservationsWithIntegrity';
import { PromptExecutions } from './cms/collections/PromptExecutionsWithUniqueness';
import { Prompts } from './cms/collections/PromptsWithIntegrity';
import { ResearchArtifacts } from './cms/collections/ResearchArtifacts';
import { Resources } from './cms/collections/Resources';
import { Software } from './cms/collections/Software';
import { TestDataBatches } from './cms/collections/TestDataBatches';
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
    meta: {
      title: 'GSLHub Research CMS',
      titleSuffix: '— GSLHub',
      description: 'Scientific content and research operations for GSLHub.',
      icons: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: '/brand/gslhub-icon.svg',
        },
      ],
    },
    components: {
      graphics: {
        Icon: '/components/admin/GSLHubAdminIcon',
        Logo: '/components/admin/GSLHubAdminLogo',
      },
      logout: {
        Button: '/components/admin/LogoutButton',
      },
    },
  },
  collections: [
    Users,
    TestDataBatches,
    ResearchAreas,
    Researchers,
    Projects,
    Benchmarks,
    Experiments,
    Prompts,
    AISystems,
    PromptExecutions,
    Observations,
    ResearchArtifacts,
    Evidence,
    Citations,
    Metrics,
    Publications,
    Software,
    Datasets,
    Resources,
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
