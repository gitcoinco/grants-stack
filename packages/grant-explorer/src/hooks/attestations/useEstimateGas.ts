import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { AttestInput } from "./config";
import { useEASConfig } from "./useEASConfig";
import { createContractCallArgs } from "./utils/createContractCallArgs";
import { TransactionError } from "./utils/handleTransactionError";

/**
 * Hook to estimate gas for the transaction.
 */
export const useEstimateGas = (
  chainId: number,
  isReady: boolean,
  data?: AttestInput
) => {
  const publicClient = usePublicClient({ chainId });
  const { easAddress, abi, schema } = useEASConfig(chainId);

  return useQuery({
    queryKey: ["gasEstimation", chainId, data, isReady],
    enabled: isReady,
    queryFn: async () => {
      if (!chainId || !publicClient || !data) {
        throw new TransactionError("Invalid Parameters", {
          message: "Required parameters are missing or invalid.",
        });
      }
      const contractCallArgs = createContractCallArgs(
        data,
        schema,
        easAddress,
        abi
      );

      const estimate = await publicClient.estimateContractGas(contractCallArgs);
      const gasPrice = await publicClient.getGasPrice();
      return estimate * gasPrice;
    },
  });
};
