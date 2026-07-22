import type { SanitizedConfig } from 'payload';
import payload from 'payload';

export const script = async (config: SanitizedConfig) => {
  if (process.env.CMS_BOOTSTRAP !== 'true') {
    return;
  }

  const previousNodeEnv = process.env.NODE_ENV;
  const previousForcePush = process.env.PAYLOAD_FORCE_DRIZZLE_PUSH;

  try {
    process.env.NODE_ENV = 'development';
    process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true';

    await payload.init({ config });
    payload.logger.info('GSLHub Payload schema bootstrap completed.');
  } finally {
    if (previousNodeEnv) {
      process.env.NODE_ENV = previousNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    if (previousForcePush) {
      process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = previousForcePush;
    } else {
      delete process.env.PAYLOAD_FORCE_DRIZZLE_PUSH;
    }
  }

  process.exit(0);
};
