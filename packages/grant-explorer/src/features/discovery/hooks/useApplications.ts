import useSWRInfinite from "swr/infinite";
import { useDataLayer, SearchBasedProjectCategory } from "data-layer";
import { useMemo } from "react";
import { CollectionV1 } from "../../collections/collections";

export type ApplicationFilter =
  | {
      type: "chains";
      chainIds: number[];
    }
  | {
      type: "refs";
      refs: string[];
    }
  | {
      type: "expanded-refs";
      refs: { chainId: number; roundId: string; id: string }[];
    };

export type ApplicationFetchOptions =
  | {
      type: "applications-search";
      queryString: string;
    }
  | {
      type: "applications-paginated";
      filter?: ApplicationFilter;
      order?: { type: "random"; seed: number };
    }
  | {
      type: "applications-collection";
      filter?: ApplicationFilter;
      order?: { type: "random"; seed: number };
    };

export function useApplications(options: ApplicationFetchOptions | null) {
  const dataLayer = useDataLayer();

  const { data, error, size, setSize } = useSWRInfinite(
    (pageIndex) =>
      options === null ? null : [pageIndex, options, "/applications"],
    async ([pageIndex]) => {
      // The first argument to useSRWInfinite will ensure that this function
      // never gets called if options is `null`. If it's still called, we fail
      // early and clearly.
      if (options === null) {
        throw new Error("Bug");
      }
      switch (options.type) {
        case "applications-search": {
          const { results, pagination } = await dataLayer.searchApplications({
            page: pageIndex,
            ...options,
          });

          // unzip data and meta
          const applications = results.map((result) => result.data);
          const applicationMeta = results.map((result) => result.meta);

          return {
            applications,
            applicationMeta,
            pagination,
          };
        }
        case "applications-paginated": {
          const { applications, pagination } =
            await dataLayer.getApplicationsPaginated({
              page: pageIndex,
              ...options,
            });
          return {
            applications,
            pagination,
            applicationMeta: [],
          };
        }
        case "applications-collection": {
          if (options.filter?.type === "expanded-refs") {
            const applications =
              await dataLayer.getApprovedApplicationsByExpandedRefs(
                options.filter?.refs ?? []
              );

            const v2Applications = applications.filter(
              (a) => a.tags?.includes("allo-v2")
            );

            return {
              applications: v2Applications,
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: v2Applications.length,
              },
              applicationMeta: [],
            };
          } else {
            throw new Error("Unsupported filter type");
          }
        }
      }
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateFirstPage: false,
    }
  );

  const applications = useMemo(
    () => data?.flatMap((page) => page.applications) ?? [],
    [data]
  );

  const applicationMeta = useMemo(
    () => data?.flatMap((page) => page.applicationMeta) ?? [],
    [data]
  );

  const totalApplicationsCount =
    data !== undefined && data.length > 0
      ? data[data.length - 1].pagination.totalItems
      : 0;

  return {
    applications,
    applicationMeta,
    isLoading: !data && !error,
    isLoadingMore:
      size > 0 && typeof data?.[size - 1] === "undefined" && !error,
    loadedPageCount: size,
    totalApplicationsCount,
    loadNextPage: () => setSize(size + 1),
    error,
    hasMorePages: totalApplicationsCount > applications.length,
  };
}

const PROJECTS_SORTING_SEED = Math.random();

export function createApplicationFetchOptions({
  searchQuery = "",
  category,
  collection,
  filters,
}: {
  searchQuery?: string;
  category?: SearchBasedProjectCategory;
  collection?: CollectionV1;
  filters: Filter[];
}): ApplicationFetchOptions {
  let applicationsFetchOptions: ApplicationFetchOptions = {
    type: "applications-paginated",
    filter: filterListToApplicationFilter(filters),
    order: {
      type: "random",
      seed: PROJECTS_SORTING_SEED,
    },
  };

  if (searchQuery.length > 0) {
    applicationsFetchOptions = {
      type: "applications-search",
      queryString: searchQuery,
    };
  } else if (category !== undefined) {
    applicationsFetchOptions = {
      type: "applications-search",
      queryString: `${category.searchQuery} --strategy=semantic`,
    };
  } else if (collection !== undefined) {
    applicationsFetchOptions = {
      type: "applications-collection",
      filter: {
        type: "expanded-refs",
        refs: collection.applications,
      },
      order: {
        type: "random",
        seed: PROJECTS_SORTING_SEED,
      },
    };
  }
  return applicationsFetchOptions;
}

export type Filter =
  | {
      type: "chain";
      chainId: number;
    }
  | { type: "roundStatus"; status: "active" | "finished" };

function filterListToApplicationFilter(
  filters: Filter[]
): ApplicationFilter | undefined {
  const filteredByChainIds = filters.reduce<number[]>((acc, filter) => {
    if (filter.type === "chain") {
      return [...acc, filter.chainId];
    }
    return acc;
  }, []);

  if (filteredByChainIds.length > 0) {
    return {
      type: "chains",
      chainIds: filteredByChainIds,
    };
  }

  return undefined;
}
