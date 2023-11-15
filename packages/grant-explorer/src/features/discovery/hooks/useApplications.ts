import useSWRInfinite from "swr/infinite";
import { useGrantsStackDataClient } from "common/src/grantsStackDataClientContext";
import { useMemo } from "react";

export type ApplicationFilter =
  | {
      type: "chains";
      chainIds: number[];
    }
  | {
      type: "refs";
      refs: string[];
    };

export type ApplicationFetchOptions =
  | {
      type: "search";
      searchQuery: string;
    }
  | {
      type: "category";
      searchQuery: string;
    }
  | {
      type: "all";
      seed: number;
      filter?: ApplicationFilter;
    };

export function useApplications(options: ApplicationFetchOptions) {
  const grantsStackDataClient = useGrantsStackDataClient();

  const { data, error, size, setSize } = useSWRInfinite(
    (pageIndex) => [pageIndex, options, "/applications"],
    async ([pageIndex]) => {
      if (options.type === "category" || options.type === "search") {
        const searchQuery =
          options.type === "category"
            ? `${options.searchQuery} --strategy=semantic`
            : options.searchQuery;

        const { results, pagination } = await grantsStackDataClient.query({
          page: pageIndex,
          type: "applications-search",
          queryString: searchQuery,
        });

        // unzip data and meta
        const applications = results.map((result) => result.data);
        const applicationMeta = results.map((result) => result.meta);

        return {
          applications,
          applicationMeta,
          pagination,
        };
      } else {
        const { applications, pagination } = await grantsStackDataClient.query({
          type: "applications-paginated",
          page: pageIndex,
          filter: options.filter,
          order: {
            type: "random",
            seed: options.seed,
          },
        });

        return { applications, pagination, applicationMeta: [] };
      }
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
