import useSWR, { SWRResponse } from "swr";
import { useDataLayer, Collection } from "data-layer";

export const useCollections = (): SWRResponse<Collection[]> => {
  const dataLayer = useDataLayer();

  return useSWR(["collections"], async () => {
    const collections = await dataLayer.getProjectCollections();
    return collections;
  });
};

export const useCollection = (
  id: string | null
): SWRResponse<Collection | undefined> => {
  const dataLayer = useDataLayer();

  return useSWR(id === null ? null : ["collections", id], async () => {
    if (id === null) {
      // The first argument to useSRW will ensure that this function never gets
      // called if options is `null`. If it's still called, we fail early and
      // clearly.
      throw new Error("Bug");
    }

    const collection = await dataLayer.getProjectCollectionById(id);
    return collection === null ? undefined : collection;
  });
};
