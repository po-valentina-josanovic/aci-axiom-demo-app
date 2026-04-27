'use client';

import { use } from 'react';
import { ProjectsProvider } from '../components/ProjectsStore';
import ProjectDetailView from '../components/ProjectDetailView';

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);

  return (
    <ProjectsProvider>
      <ProjectDetailView projectId={id} />
    </ProjectsProvider>
  );
}
