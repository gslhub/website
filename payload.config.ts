import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';

import { AISystems } from './cms/collections/AISystemsWithIntegrity';
import { Benchmarks } from './cms/collections/BenchmarksWithIntegrity';
import { Citations } from './cms/collections/CitationsWithIntegrity';
import { Datasets } from './cms/collections/DatasetsWithIntegrity';
import { Evidence } from './cms/collections/EvidenceWithExecutionContext';
import { Experiments } from './cms/collections/ExperimentsWithIntegrity';
import { MetricDefinitions } from './cms/collections/MetricDefinitionsWithIntegrity';
import { Metrics } from './cms/collections/MetricsWithIntegrity';
import { Observations } from './cms/collections/ObservationsWithIntegrity';
import { Projects } from './cms/collections/ProjectsWithIntegrity';
import { PromptExecutions } from './cms/collections/PromptExecutionsWithUniqueness';
import { Prompts } from './cms/collections/PromptsWithIntegrity';
import { Publications } from './cms/collections/PublicationsWithIntegrity';
import { ResearchArtifacts } from './cms/collections/ResearchArtifactsWithStorage';
import { Resources } from './cms/collections/ResourcesWithIntegrity';
import { Software } from './cms/collections/SoftwareWithIntegrity';
import { StorageVerifications } from './cms/collections/StorageVerifications';
import { TestDataBatches } from './cms/collections/TestDataBatches';
import { Users } from './cms/collections/Users';
import { ResearchAreas, Researchers } from './cms/collections/research';

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
    StorageVerifications,
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
    MetricDefinitions,
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
