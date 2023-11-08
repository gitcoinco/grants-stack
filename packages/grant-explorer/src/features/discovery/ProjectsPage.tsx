import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import { useCartStorage } from "../../store";
// TODO: expose item types from grants-stack-data-client
import { ApplicationStatus, CartProject } from "../api/types";
import { useMemo, useState } from "react";
import PlusIcon from "@heroicons/react/20/solid/PlusIcon";
import { LoadingRing } from "../common/Spinner";
import { ApplicationSummary } from "common/src/grantsStackDataClientContext";
import { ProjectCard, ProjectCardSkeleton } from "../common/ProjectCard";
import { useApplications } from "./hooks/useApplications";

function createCartProjectFromApplication(
  application: ApplicationSummary
): CartProject {
  return {
    projectRegistryId: application.projectId,
    roundId: application.roundId,
    chainId: application.chainId,
    grantApplicationId: createCompositeRoundApplicationId(application),
    // TODO: add recipient when it is available
    recipient: "0x0000000000000000000000",
    grantApplicationFormAnswers: [],
    status: ApplicationStatus.APPROVED,
    applicationIndex: Number(application.roundApplicationId),
    projectMetadata: {
      title: application.name,
      description: application.summaryText,
      bannerImg: application.bannerImageCid,
      logoImg: application.logoImageCid,
    } as CartProject["projectMetadata"],
    amount: "",
  };
}

function createCompositeRoundApplicationId(application: ApplicationSummary) {
  return `${application.roundId}-${application.roundApplicationId}`;
}

const ProjectsPage = () => {
  const [seed] = useState(() => Math.random());
  const {
    applications,
    totalApplicationsCount,
    isLoading,
    isLoadingMore,
    loadNextPage,
    hasMorePages,
  } = useApplications(seed);

  const { projects, add, remove } = useCartStorage();

  const applicationIdsInCart = useMemo(() => {
    return new Set(projects.map((project) => project.grantApplicationId));
  }, [projects]);

  function addApplicationToCart(application: ApplicationSummary) {
    const cartProject = createCartProjectFromApplication(application);
    add(cartProject);
  }

  function removeApplicationFromCart(application: ApplicationSummary) {
    remove(createCompositeRoundApplicationId(application));
  }

  function applicationExistsInCart(application: ApplicationSummary) {
    return applicationIdsInCart.has(
      createCompositeRoundApplicationId(application)
    );
  }

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={
          isLoading ? "Loading..." : `All projects (${totalApplicationsCount})`
        }
        className="flex-wrap pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {applications.map((application) => (
            <div key={application.applicationRef}>
              <ProjectCard
                application={application}
                inCart={applicationExistsInCart(application)}
                addToCart={addApplicationToCart}
                removeFromCart={removeApplicationFromCart}
              />
            </div>
          ))}
          {isLoadingMore && (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          )}
          {isLoading === false && hasMorePages === true && (
            <div className="flex items-center">
              <button
                className="rounded-3xl border border-white bg-[#F3F3F5] text-md font-medium px-5 py-3 flex items-center"
                disabled={isLoadingMore}
                onClick={() => loadNextPage()}
              >
                {isLoadingMore ? (
                  <LoadingRing className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5 mr-1" />
                    <span>Load more</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default ProjectsPage;
