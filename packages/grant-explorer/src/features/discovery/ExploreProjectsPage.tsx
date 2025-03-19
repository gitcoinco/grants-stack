import { GradientLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { useDataLayer, v2Project } from "data-layer";
import { ProjectCard } from "../common/ProjectCard";
import { LoadingRing } from "../common/Spinner";
import { useProjects, useProjectsBySearchTerm } from "./hooks/useProjects";
import { LandingSection } from "./LandingSection";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function ExploreProjectsPage(): JSX.Element {
  const dataLayer = useDataLayer();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const {
    data: projectsFromSearch,
    isLoading: searchLoading,
    error: searchError,
  } = useProjectsBySearchTerm(
    {
      searchTerm: searchQuery,
      first: 10,
      offset: 0,
    },
    dataLayer
  );

  const onQueryChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const q = e.target.value;
    setSearchInput(q);
  };

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearchQuery(`'${searchInput}'`);
  }

  return (
    <GradientLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={
          searchQuery.length > 0
            ? "Search results"
            : projects
              ? "All projects"
              : "Loading projects..."
        }
        action={
          projects && (
            <div className="font-mono flex gap-x-4 items-center w-full">
              <form
                className="relative"
                onSubmit={onSearchSubmit}
                onBlur={onSearchSubmit}
                data-ph-capture-attribute-search-query={searchInput}
              >
                <MagnifyingGlassIcon
                  width={22}
                  height={22}
                  className="text-white absolute left-[14px] top-[10px]"
                />
                <input
                  type="text"
                  name="query"
                  placeholder="Search..."
                  onChange={onQueryChange}
                  value={searchInput}
                  className="w-full sm:w-96 border-2 border-white rounded-3xl px-4 py-2 mb-2 sm:mb-0 bg-white/50 pl-12 focus:border-white focus:ring-0 text-black font-mono"
                />
              </form>
            </div>
          )
        }
      ></LandingSection>

      {(searchQuery.length > 0
        ? searchError !== undefined
        : error !== undefined) && (
        <div className="text-center p-4 my-3">Something went wrong</div>
      )}
      {(searchQuery.length > 0
        ? searchError === undefined
        : error === undefined) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <PaginatedProjectsList
            projects={searchQuery.length > 0 ? projectsFromSearch : projects}
          />
        </div>
      )}
      {(searchQuery.length > 0 ? searchLoading : isLoading) && (
        <div className="flex justify-center my-8">
          <LoadingRing />
        </div>
      )}
    </GradientLayout>
  );
}

export type PaginatedProjectsListProps = {
  projects: v2Project[] | undefined;
};

export function PaginatedProjectsList({
  projects,
}: PaginatedProjectsListProps): JSX.Element {
  return (
    <>
      {projects &&
        projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
    </>
  );
}
