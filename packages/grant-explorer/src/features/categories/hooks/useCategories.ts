import useSWR, { SWRResponse } from "swr";
import { useDataLayer, SearchBasedProjectCategory } from "data-layer";

export const useCategories = (): SWRResponse<SearchBasedProjectCategory[]> => {
  const dataLayer = useDataLayer();

  return useSWR(["categories"], async () => {
    const categories = await dataLayer.getSearchBasedCategories();
    return categories;
  });
};

export const useCategory = (
  id: string | null
): SWRResponse<SearchBasedProjectCategory | undefined> => {
  const dataLayer = useDataLayer();

  return useSWR(id === null ? null : ["categories"], async () => {
    if (id === null) {
      // The first argument to useSRW will ensure that this function never gets
      // called if options is `null`. If it's still called, we fail early and
      // clearly.
      throw new Error("Bug");
    }

    const category = await dataLayer.getSearchBasedCategoryById(id);
    return category === null ? undefined : category;
  });
};
