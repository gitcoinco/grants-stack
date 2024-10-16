import { useMutation } from "@tanstack/react-query";
import { useWalletClient } from "wagmi";
import { ProgressStatus } from "./config";
import {
  handleTransactionError,
  TransactionError,
} from "./utils/handleTransactionError";

/**
 * Hook to switch the blockchain network.
 */
export const useSwitchChain = (
  chainId: number,
  setStatus: (status: ProgressStatus) => void
) => {
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async () => {
      if (!walletClient) {
        throw new TransactionError("Wallet Client Required", {
          message: "Please connect your wallet.",
        });
      }
      try {
        await walletClient.switchChain({ id: chainId });
      } catch (error) {
        handleTransactionError(error as Error);
      }
    },
    onError: (error: Error) => {
      console.error("Error switching chain:", error);
      setStatus(ProgressStatus.SWITCH_CHAIN);
    },
    onSuccess: () => {
      setStatus(ProgressStatus.NOT_STARTED);
    },
  });
};
