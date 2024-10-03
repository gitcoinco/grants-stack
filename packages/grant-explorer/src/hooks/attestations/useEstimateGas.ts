import { useMutation } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { useEASConfig } from "./useEASConfig";
import { AttestInput } from "./config";
import { createContractCallArgs } from "./utils/createContractCallArgs";
import { TransactionError } from "./utils/handleTransactionError";

/**
 * Hook to estimate gas for the transaction.
 */
export const useEstimateGas = (chainId: number) => {
  const publicClient = usePublicClient({ chainId });
  const { easAddress, abi, schema } = useEASConfig(chainId);

  return useMutation({
    mutationFn: async (data: AttestInput) => {
      if (!chainId || !publicClient) {
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
