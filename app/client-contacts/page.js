'use client';

import { ProjectsProvider } from '../potential-projects/components/ProjectsStore';
import ClientContactsView from './ClientContactsView';

export default function ClientContactsPage() {
  return (
    <ProjectsProvider>
      <ClientContactsView />
    </ProjectsProvider>
  );
}
