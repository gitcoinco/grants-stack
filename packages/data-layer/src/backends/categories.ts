import { SearchBasedProjectCategory } from "../data.types";
import { CATEGORIES_HARDCODED } from "./categories.data";

export const getSearchBasedCategories = (): Promise<
  SearchBasedProjectCategory[]
> => {
  return Promise.resolve(CATEGORIES_HARDCODED);
};

export const getSearchBasedCategoryById = (
  id: string,
): Promise<SearchBasedProjectCategory | null> => {
  return Promise.resolve(CATEGORIES_HARDCODED.find((c) => c.id === id) ?? null);
};
