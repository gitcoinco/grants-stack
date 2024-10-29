import { useMutation } from "@tanstack/react-query";
import { AttestInput, ProgressStatus } from "./config";
import { createContractCallArgs } from "./utils/createContractCallArgs";
import {
  handleTransactionError,
  TransactionError,
} from "./utils/handleTransactionError";
import { Abi, PublicClient, WalletClient } from "viem";

/**
 * Hook for the attestation mutation logic.
 */
export const useAttestMutation = (
  chainId: number,
  address: string | undefined,
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  easAddress: string | undefined,
  abi: Abi | undefined,
  schema: string | undefined,
  attestationFee: bigint,
  updateStatus: (status: ProgressStatus) => void,
  handleToggleModal: () => void
) => {
  return useMutation({
    mutationFn: async (data: AttestInput): Promise<string> => {
      try {
        if (
          !chainId ||
          !address ||
          !walletClient ||
          !easAddress ||
          !data ||
          !schema ||
          !abi ||
          !publicClient
        ) {
          throw new TransactionError("Invalid Parameters", {
            message: "Required parameters are missing or invalid.",
          });
        }

        updateStatus(ProgressStatus.IN_PROGRESS);

        const contractCallArgs = createContractCallArgs(
          data,
          schema,
          easAddress,
          abi,
          attestationFee
        );

        const { request } =
          await publicClient.simulateContract(contractCallArgs);

        const hash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 2,
        });
        const receipt = await publicClient.getTransactionReceipt({
          hash,
        });
        // TODO make this dynamic when attestation network expands to more networks (Legacy-Proxy) have different logs
        const attestationUID = receipt.logs[2].topics[1] as string;

        return attestationUID;
      } catch (error) {
        handleTransactionError(error as Error);
        return "";
      }
    },
    onError: (error: Error) => {
      updateStatus(ProgressStatus.NOT_STARTED);
      console.error("Error attesting data:", error);
    },
    onSuccess: () => {
      handleToggleModal();
      updateStatus(ProgressStatus.IS_SUCCESS);
    },
  });
};
