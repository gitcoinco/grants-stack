import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import useSWRInfinite from "swr/infinite";
import { useCartStorage } from "../../store";
// TODO: expose item types from grants-stack-data-client
import { ApplicationSummary } from "grants-stack-data-client/dist/openapi-search-client/models";
import { ApplicationStatus, CartProject } from "../api/types";
import { useMemo, useState } from "react";
import PlusIcon from "@heroicons/react/20/solid/PlusIcon";
import { LoadingRing } from "../common/Spinner";
import { useGrantsStackDataClient } from "common/src/grantsStackDataClientContext";
import { ProjectCard, ProjectCardSkeleton } from "../common/ProjectCard";

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
  const grantsStackDataClient = useGrantsStackDataClient();

  const {
    data: pages,
    isLoading,
    size: currentPage,
    setSize: setCurrentPage,
  } = useSWRInfinite(
    (pageIndex) => [pageIndex, seed, "/applications"],
    ([pageIndex]) => {
      grantsStackDataClient.query({
        type: "applications-paginated",
        page: 1,
      });

      return grantsStackDataClient.query({
        type: "applications-paginated",
        page: pageIndex,
        order: {
          type: "random",
          seed,
        },
      });
    }
  );

  const isLoadingMore =
    isLoading ||
    (currentPage > 0 &&
      pages !== undefined &&
      typeof pages[currentPage - 1] === "undefined");

  const totalApplicationCount =
    pages === undefined || pages.length === 0
      ? 0
      : pages[0].pagination.totalItems;

  const hasMore = useMemo(() => {
    if (pages === undefined) {
      return false;
    }

    const totalItemsLoaded = pages.reduce(
      (acc, page) => acc + page.applications.length,
      0
    );

    return totalItemsLoaded < totalApplicationCount;
  }, [pages, totalApplicationCount]);

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
          isLoading || pages === undefined
            ? "Loading..."
            : `All projects (${totalApplicationCount})`
        }
        className="flex-wrap pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4">
          {pages?.map((page) =>
            page.applications.map((application) => (
              <div key={application.applicationRef}>
                <ProjectCard
                  application={application}
                  inCart={applicationExistsInCart(application)}
                  addToCart={addApplicationToCart}
                  removeFromCart={removeApplicationFromCart}
                />
              </div>
            ))
          )}
          {isLoadingMore && (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          )}
          {isLoading === false && hasMore === true && (
            <div className="flex items-center">
              <button
                className="rounded-3xl border border-white bg-[#F3F3F5] text-md font-medium px-5 py-3 flex items-center"
                disabled={isLoadingMore}
                onClick={() => setCurrentPage(currentPage + 1)}
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
