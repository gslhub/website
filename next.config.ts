import { execSync } from 'node:child_process';

import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

function resolveDeploymentId() {
  if (process.env.NEXT_DEPLOYMENT_ID) {
    return process.env.NEXT_DEPLOYMENT_ID;
  }

  try {
    return execSync('git rev-parse --short=12 HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'gslhub-0.6.1';
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  deploymentId: resolveDeploymentId(),
};

export default withPayload(nextConfig);
