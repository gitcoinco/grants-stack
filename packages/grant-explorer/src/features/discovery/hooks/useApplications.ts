import useSWRInfinite from "swr/infinite";
import { useGrantsStackDataClient } from "common/src/grantsStackDataClientContext";
import { useMemo } from "react";

export function useApplications(seed: number) {
  const grantsStackDataClient = useGrantsStackDataClient();

  const { data, error, size, setSize } = useSWRInfinite(
    (pageIndex) => [pageIndex, seed, "/applications"],
    ([pageIndex]) =>
      grantsStackDataClient.query({
        type: "applications-paginated",
        page: pageIndex,
        order: {
          type: "random",
          seed,
        },
      })
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
