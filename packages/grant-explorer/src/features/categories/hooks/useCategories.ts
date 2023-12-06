import useSWR, { SWRResponse } from "swr";
import { useDataLayer, SearchBasedProjectCategory } from "data-layer";

export const useCategories = (): SWRResponse<SearchBasedProjectCategory[]> => {
  const dataLayer = useDataLayer();

  return useSWR(["categories"], async () => {
    const { categories } = await dataLayer.query({
      type: "search-based-project-categories",
    });
    return categories;
  });
};

export const useCategory = (
  id: string | null
): SWRResponse<SearchBasedProjectCategory | undefined> => {
  const dataLayer = useDataLayer();

  return useSWR(["categories"], async () => {
    if (id === null) {
      return undefined;
    } else {
      const { category } = await dataLayer.query({
        type: "search-based-project-category",
        id,
      });
      return category === null ? undefined : category;
    }
  });
};
