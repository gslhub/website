import type { Metadata } from 'next';

import { ResearchInfrastructurePage } from '@/components/research-infrastructure-page';

export const metadata: Metadata = {
  title: 'Research Infrastructure | GSLHub',
  description:
    'GSLHub research infrastructure for reproducible experiments on generative search visibility, evidence preservation, governed metrics and scientific reproducibility.',
};

export default function ResearchInfrastructureEnglishPage() {
  return <ResearchInfrastructurePage locale="en" />;
}
