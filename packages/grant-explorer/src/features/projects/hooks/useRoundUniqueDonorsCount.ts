import useSWR from "swr";
import { DataLayer } from "data-layer";
import { Address, getAddress, zeroAddress } from "viem";

type Params = {
  chainId?: number;
  roundId?: string;
};

export function useRoundUniqueDonorsCount(
  params: Params,
  dataLayer: DataLayer
) {
  const shouldFetch = Object.values(params).every(Boolean);
  return useSWR(
    shouldFetch ? ["roundUniqueDonorsCount", params] : null,
    async () => {
      const validatedParams = {
        chainId: params.chainId as number,
        roundId: getAddress(
          params.roundId ?? zeroAddress
        ).toLowerCase() as Lowercase<Address>,
      };

      const data = await dataLayer.getRoundUniqueDonorsCount(validatedParams);
      return data;
    }
  );
}
