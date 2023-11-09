import useSWRInfinite from "swr/infinite";
import { useGrantsStackDataClient } from "common/src/grantsStackDataClientContext";
import { useMemo } from "react";

export type ApplicationFetchOptions =
  | {
      searchQuery: string;
    }
  | {
      seed: number;
    };

export function useApplications(options: ApplicationFetchOptions) {
  const grantsStackDataClient = useGrantsStackDataClient();

  const { data, error, size, setSize } = useSWRInfinite(
    (pageIndex) => [pageIndex, options, "/applications"],
    async ([pageIndex]) => {
      if ("searchQuery" in options) {
        const result = await grantsStackDataClient.query({
          type: "applications-search",
          queryString: options.searchQuery,
        });

        const applications = result.results.map((r) => r.data);

        return {
          applications,
          pagination: { totalItems: applications.length },
        };
      } else {
        return grantsStackDataClient.query({
          type: "applications-paginated",
          page: pageIndex,
          order: {
            type: "random",
            seed: options.seed,
          },
        });
      }
    }
  );

  const applications = useMemo(
    () => data?.flatMap((page) => page.applications) ?? [],
    [data]
  );

  const totalApplicationsCount =
    data !== undefined && data.length > 0
      ? data[data.length - 1].pagination.totalItems
      : 0;

  return {
    applications,
    isLoading: !data && !error,
    isLoadingMore: size > 0 && typeof data?.[size - 1] === "undefined",
    loadedPageCount: size,
    totalApplicationsCount,
    loadNextPage: () => setSize(size + 1),
    error,
    hasMorePages: totalApplicationsCount > applications.length,
  };
}
