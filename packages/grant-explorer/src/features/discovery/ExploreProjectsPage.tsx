import { GradientLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { useDataLayer, v2Project } from "data-layer";
import { ProjectCard } from "../common/ProjectCard";
import { LoadingRing } from "../common/Spinner";
import { useProjects } from "./hooks/useProjects";

export function ExploreProjectsPage(): JSX.Element {
  const dataLayer = useDataLayer();

  const {
    data: projects,
    isLoading,
    error,
  } = useProjects(
    {
      first: 100,
      offset: 0,
    },
    dataLayer
  );

  return (
    <GradientLayout showWalletInteraction>
      <LandingHero />
      {error !== undefined && (
        <div className="text-center p-4 my-3">Something went wrong</div>
      )}
      {error === undefined && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          <PaginatedProjectsList projects={projects} isLoading={isLoading} />
        </div>
      )}
    </GradientLayout>
  );
}

export type PaginatedProjectsListProps = {
  projects: v2Project[] | undefined;
  isLoading: boolean;
};

export function PaginatedProjectsList({
  projects,
  isLoading,
}: PaginatedProjectsListProps): JSX.Element {
  return (
    <>
      {projects &&
        projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      {isLoading && (
        <div className="flex justify-center">
          <LoadingRing />
        </div>
      )}
    </>
  );
}
