import type { Metadata } from 'next';

import SecureAdminLogin from '@/components/admin/SecureAdminLogin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Research CMS Access | GSLHub',
  description: 'Private access to the GSLHub research administration system.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function CMSLoginPage() {
  return <SecureAdminLogin />;
}
