import useSWR, { SWRResponse } from "swr";
import { useDataLayer, Collection } from "data-layer";

export const useCollections = (): SWRResponse<Collection[]> => {
  const dataLayer = useDataLayer();

  return useSWR(["collections"], async () => {
    const { collections } = await dataLayer.query({
      type: "project-collections",
    });

    return collections;
  });
};

export const useCollection = (
  id: string | null
): SWRResponse<Collection | undefined> => {
  const dataLayer = useDataLayer();

  return useSWR(id === null ? null : ["collections", id], async () => {
    if (id === null) {
      // Type narrowing only. Should never happen as long as `null` is passed as the first argument to `useSWR` to enable conditional fetching.
      throw new Error("Bug");
    }
    const { collection } = await dataLayer.query({
      type: "project-collection",
      id,
    });

    // TODObard return null instead of undefined if not found
    return collection === null ? undefined : collection;
  });
};
