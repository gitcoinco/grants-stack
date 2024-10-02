import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { normalize } from "viem/ens";
import { usePublicClient } from "wagmi";

export const useResolveENS = (address: Address) => {
  const publicClient = usePublicClient({
    chainId: 1,
  });

  return useQuery({
    queryKey: ["resolveENS"],
    enabled: !!address,
    queryFn: async () => {
      if (!address || !publicClient) return;
      const ens = await publicClient.getEnsName({
        address,
        universalResolverAddress: "0xce01f8eee7E479C928F8919abD53E553a36CeF67",
      });

      const name = ens ? normalize(ens) : undefined;
      return name;
    },
  });
};
