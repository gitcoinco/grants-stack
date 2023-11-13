import { useSearchParams } from "react-router-dom";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import { useCartStorage } from "../../store";
import { ApplicationStatus, CartProject } from "../api/types";
import { useMemo, useState } from "react";
import { ApplicationSummary } from "common/src/grantsStackDataClientContext";
import {
  ApplicationFetchOptions,
  useApplications,
} from "./hooks/useApplications";
import { PaginatedProjectsList } from "./PaginatedProjectsList";
import { useDebounce } from "use-debounce";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useCategory } from "../categories/hooks/useCategories";

function createCartProjectFromApplication(
  application: ApplicationSummary
): CartProject {
  return {
    projectRegistryId: application.projectId,
    roundId: application.roundId,
    chainId: application.chainId,
    grantApplicationId: createCompositeRoundApplicationId(application),
    recipient: application.payoutWalletAddress,
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

const PROJECTS_SORTING_SEED = Math.random();

export function ExploreProjectsPage(): JSX.Element {
  const [params] = useSearchParams();

  const category = useCategory(params.get("categoryId"));

  const seed = PROJECTS_SORTING_SEED;
  const [searchQuery, setSearchQuery] = useState(category?.searchQuery ?? "");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 400);

  const applicationsFetchOptions: ApplicationFetchOptions =
    debouncedSearchQuery.length === 0
      ? { seed }
      : {
          searchQuery: debouncedSearchQuery,
        };

  const {
    applications,
    totalApplicationsCount,
    isLoading,
    isLoadingMore,
    loadNextPage,
    hasMorePages,
  } = useApplications(applicationsFetchOptions);

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

  const pageTitle = category?.name ?? "All projects";

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={
          isLoading ? "Loading..." : `${pageTitle} (${totalApplicationsCount})`
        }
        action={
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <MagnifyingGlassIcon
              width={22}
              height={22}
              className="text-white absolute left-[14px] top-[10px]"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-96 border-2 border-white rounded-3xl px-4 py-2 mb-2 sm:mb-0 bg-white/50 pl-12 focus:border-white focus:ring-0 text-black font-mono"
            />
          </form>
        }
        className="flex-wrap"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <PaginatedProjectsList
            applications={applications}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMorePages={hasMorePages}
            loadNextPage={loadNextPage}
            onAddApplicationToCart={addApplicationToCart}
            onRemoveApplicationFromCart={removeApplicationFromCart}
            applicationExistsInCart={applicationExistsInCart}
          />
        </div>
      </LandingSection>
    </DefaultLayout>
  );
}
