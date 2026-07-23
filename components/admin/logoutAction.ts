'use server';

import config from '@payload-config';
import { logout } from '@payloadcms/next/auth';

export async function logoutAction() {
  await logout({
    allSessions: true,
    config,
  });
}
