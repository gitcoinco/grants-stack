import useSWR, { SWRResponse } from "swr";
import { CommunityCollection } from "../community";
import { CollectionV1, parseCollection } from "../collections";
import { getConfig } from "common/src/config";
import communityCollections from "../community";

const config = getConfig();

export const useCollections = (): SWRResponse<CommunityCollection[]> => {
  return useSWR(["collections"], async () => {
    return communityCollections;
  });
};

export const useIpfsCollection = (
  cid: string | undefined
): SWRResponse<CollectionV1> => {
  return useSWR(
    cid === undefined ? null : ["collections/ipfs", cid],
    async () => {
      const url = `${config.ipfs.baseUrl}/ipfs/${cid}`;
      return fetch(url)
        .then((res) => res.json())
        .then(parseCollection);
    }
  );
};
