'use client';

import { use } from 'react';
import { ProjectsProvider } from '../../potential-projects/components/ProjectsStore';
import ClientDetailView from './ClientDetailView';

export default function ClientDetailPage({ params }) {
  const { company } = use(params);
  const companyName = decodeURIComponent(company);

  return (
    <ProjectsProvider>
      <ClientDetailView companyName={companyName} />
    </ProjectsProvider>
  );
}
