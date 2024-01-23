import { useSearchParams } from "react-router-dom";
import { GradientLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import { useCartStorage } from "../../store";
import { CartProject } from "../api/types";
import { useMemo, useState } from "react";
import { ApplicationSummary } from "data-layer";
import {
  createApplicationFetchOptions,
  useApplications,
  Filter,
} from "./hooks/useApplications";
import { PaginatedProjectsList } from "./PaginatedProjectsList";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useCategory } from "../categories/hooks/useCategories";
import { useCollection } from "../collections/hooks/useCollections";
import { CollectionDetails } from "../collections/CollectionDetails";
import { FilterDropdown, FilterDropdownOption } from "../common/FilterDropdown";
import { getEnabledChains } from "../../app/chainConfig";

const FILTER_OPTIONS: FilterDropdownOption<Filter>[] = [
  {
    label: "Network",
    children: getEnabledChains().map(({ id, name }) => ({
      label: `Projects on ${name}`,
      value: { type: "chain", chainId: id },
    })),
    allowMultiple: true,
  },
];

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
    status: "APPROVED",
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
  return `${application.roundId}-${application.roundApplicationId}`.toLowerCase();
}

function urlParamsToFilterList(urlParams: URLSearchParams): Filter[] {
  const chainIds = urlParams.getAll("chainId");

  return chainIds.map((chainId) => ({
    type: "chain",
    chainId: Number(chainId),
  }));
}

function filterListToUrlParams(filters: Filter[]): URLSearchParams {
  return filters.reduce((acc, filter) => {
    if (filter.type === "chain") {
      acc.append("chainId", String(filter.chainId));
    }
    return acc;
  }, new URLSearchParams());
}

export function ExploreProjectsPage(): JSX.Element {
  const [urlParams, setUrlParams] = useSearchParams();
  const [filters, setFilters] = useState<Filter[]>(
    urlParamsToFilterList(urlParams)
  );

  const category = useCategory(urlParams.get("categoryId"));
  const collection = useCollection(urlParams.get("collectionId"));

  const [searchInput, setSearchInput] = useState(urlParams.get("q") ?? "");
  const [searchQuery, setSearchQuery] = useState(urlParams.get("q") ?? "");

  const applicationsFetchOptions =
    category.isLoading || collection.isLoading
      ? null
      : createApplicationFetchOptions({
          searchQuery,
          category: category.data,
          collection: collection.data,
          filters,
        });

  const {
    applications,
    applicationMeta,
    totalApplicationsCount,
    isLoading,
    isLoadingMore,
    loadNextPage,
    hasMorePages,
  } = useApplications(applicationsFetchOptions);

  const { projects, add, remove } = useCartStorage();

  const allSemantic = applicationMeta.every(
    (item) => item.searchType === "semantic"
  );

  const applicationIdsInCart = useMemo(() => {
    return new Set(
      projects.map((project) => project.grantApplicationId.toLowerCase())
    );
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

  let pageTitle = "All projects";

  if (searchQuery.length > 0) {
    pageTitle = "Search results";
  } else if (category.data !== undefined) {
    pageTitle = category.data.name;
  } else if (collection.data !== undefined) {
    pageTitle = collection.data.name;
  }

  const onQueryChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const q = e.target.value;
    setSearchInput(q);
  };

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearchQuery(searchInput);
    setUrlParams(`?q=${searchInput}`);
  }

  function onFiltersChange(newFilters: Filter[]) {
    setFilters(newFilters);
    setUrlParams(`?${filterListToUrlParams(newFilters).toString()}`);
  }

  return (
    <GradientLayout showWalletInteraction>
      <LandingHero />

      {collection.data && (
        <CollectionDetails
          collection={collection.data}
          projectsInView={applications.length}
          onAddAllApplicationsToCart={() =>
            applications.forEach(addApplicationToCart)
          }
        />
      )}

      <LandingSection
        title={
          collection
            ? ""
            : isLoading
            ? "Loading..."
            : `${pageTitle} (${totalApplicationsCount})`
        }
        action={
          !collection && (
            <div className="font-mono flex gap-x-4">
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
              {searchQuery.length === 0 && (
                <div>
                  <span className="mr-2">Filter by</span>
                  <FilterDropdown<Filter>
                    onChange={onFiltersChange}
                    selected={filters}
                    options={FILTER_OPTIONS}
                  />
                </div>
              )}
            </div>
          )
        }
      >
        {isLoading === false &&
          isLoadingMore === false &&
          applications.length === 0 && (
            <p>
              Your search did not match any projects. Try again using different
              keywords.
            </p>
          )}
        {isLoading === false &&
          applicationMeta.length > 0 &&
          allSemantic &&
          !category && (
            <p className="mt-4 mb-10 text-lg">
              Your search did not match any projects. Try again or feel free to
              browse through projects similar to your search.
            </p>
          )}
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
    </GradientLayout>
  );
}
