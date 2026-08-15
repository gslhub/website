import type { Metadata } from 'next';

import { ResearchInfrastructurePage } from '@/components/research-infrastructure-page';

export const metadata: Metadata = {
  title: 'Infraestructura de Investigación | GSLHub',
  description:
    'Infraestructura GSLHub para experimentos reproducibles sobre visibilidad en búsqueda generativa, preservación de evidencia, métricas gobernadas y reproducibilidad científica.',
};

export default function ResearchInfrastructureSpanishPage() {
  return <ResearchInfrastructurePage locale="es" />;
}
