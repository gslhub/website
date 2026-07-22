import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://gslhub.com'),
  title: {
    default: 'GSLHub — Generative Search Lab Hub',
    template: '%s | GSLHub',
  },
  description:
    'Applied research in generative search, artificial intelligence, SEO/GEO, automation and digital transformation.',
  openGraph: {
    title: 'GSLHub — Generative Search Lab Hub',
    description:
      'Research, software, datasets and open knowledge for generative search and applied artificial intelligence.',
    url: 'https://gslhub.com',
    siteName: 'GSLHub',
    type: 'website',
  },
};

export default function FrontendLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
