import { useParams } from "react-router-dom";
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
import { CollectionDetails } from "../collections/CollectionDetails";
import { FilterDropdown, FilterDropdownOption } from "../common/FilterDropdown";
import { getEnabledChains } from "../../app/chainConfig";
import { useIpfsCollection } from "../collections/hooks/useCollections";

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

export function createCartProjectFromApplication(
  application: ApplicationSummary
): CartProject {
  return {
    anchorAddress: application.anchorAddress,
    projectRegistryId: application.projectId,
    roundId: application.roundId,
    chainId: application.chainId,
    grantApplicationId: application.roundApplicationId,
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
  return [
    application.chainId,
    application.roundId.toLowerCase(),
    application.roundApplicationId.toLowerCase(),
  ].join(":");
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
  const { collectionCid } = useParams();
  const [filters, setFilters] = useState<Filter[]>(
    urlParamsToFilterList(urlParams)
  );

  const category = useCategory(urlParams.get("categoryId"));
  const collection = useIpfsCollection(collectionCid);

  const [searchInput, setSearchInput] = useState(urlParams.get("q") ?? "");
  const [searchQuery, setSearchQuery] = useState(urlParams.get("q") ?? "");

  const isPreloading = category.isLoading || collection.isLoading;
  const preloadingError = category.error || collection.error;

  const applicationsFetchOptions =
    isPreloading || preloadingError
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
    isLoading: applicationsLoading,
    isLoadingMore,
    loadNextPage,
    hasMorePages,
    error: applicationsError,
  } = useApplications(
    isPreloading || preloadingError ? null : applicationsFetchOptions
  );

  const isLoading = isPreloading || applicationsLoading;
  const error = preloadingError || applicationsError;

  const allSemantic = applicationMeta.every(
    (item) => item.searchType === "semantic"
  );

  const { projects, add, remove } = useCartStorage();

  const applicationIdsInCart = useMemo(() => {
    return new Set(
      projects.map((project) =>
        [project.chainId, project.roundId, project.grantApplicationId].join(":")
      )
    );
  }, [projects]);

  function addApplicationToCart(application: ApplicationSummary) {
    const cartProject = createCartProjectFromApplication(application);
    add(cartProject);
  }

  function removeApplicationFromCart(application: ApplicationSummary) {
    const cartProject = createCartProjectFromApplication(application);
    remove(cartProject);
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
    pageTitle = collection.data.name ?? "Collection";
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
        left={
          <div
            className="rounded-md mr-auto font-mono"
            style={{
              backgroundImage:
                "linear-gradient(123.78deg, #FFD6C9 17.77%, #B8D9E7 35.47%, #ABE3EB 59.3%, #F2DD9E 91.61%)",
              padding: "1px",
            }}
          >
            <a
              className="bg-[#cdf1f3] text-black flex items-center px-4 py-2 rounded-md block"
              href="https://grantscan.gitcoin.co/"
              title="Discover grants using AI"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="mr-2 h-4 w-4"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.05295 13.1667H10.9471M9.00002 1.5V2.33333M14.3033 3.6967L13.7141 4.28596M16.5001 8.99996H15.6667M2.33339 8.99996H1.50006M4.28597 4.28595L3.69672 3.6967M6.05374 11.9463C4.42655 10.3191 4.42655 7.68093 6.05374 6.05374C7.68092 4.42656 10.3191 4.42656 11.9463 6.05374C13.5735 7.68093 13.5735 10.3191 11.9463 11.9463L11.4904 12.4022C10.963 12.9296 10.6667 13.6449 10.6667 14.3908V14.8333C10.6667 15.7538 9.92049 16.5 9.00002 16.5C8.07954 16.5 7.33335 15.7538 7.33335 14.8333V14.3908C7.33335 13.6449 7.03706 12.9296 6.50965 12.4022L6.05374 11.9463Z"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <span>GrantScan</span>
            </a>
          </div>
        }
        title={
          collection
            ? ""
            : isLoading
            ? "Loading..."
            : `${pageTitle} (${totalApplicationsCount})`
        }
        action={
          collection && (
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
        {error !== undefined && (
          <div className="text-center p-4 my-3">Something went wrong</div>
        )}

        {isLoading === false &&
          isLoadingMore === false &&
          applications.length === 0 &&
          collection === undefined && (
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
        {error === undefined && (
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
        )}
      </LandingSection>
    </GradientLayout>
  );
}
