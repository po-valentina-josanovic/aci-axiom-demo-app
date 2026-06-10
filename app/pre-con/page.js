import { ProjectsProvider } from '../potential-projects/components/ProjectsStore';
import PreConView from './PreConView';

export default function PreConPage() {
  return (
    <ProjectsProvider>
      <PreConView />
    </ProjectsProvider>
  );
}
