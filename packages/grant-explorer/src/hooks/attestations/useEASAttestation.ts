import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { AttestInput, ProgressStatus } from "./config";
import { useEASConfig } from "./useEASConfig";
import { useAttestationStatus } from "./useAttestationStatus";
import { useSwitchChain } from "./useSwitchChain";
import { useEstimateGas } from "./useEstimateGas";
import { useAttestMutation } from "./useAttestMutation";

/**
 * Main hook to manage EAS Attestations.
 */
export const useEASAttestation = (
  chainId: number,
  handleToggleModal: () => void,
  data?: AttestInput
) => {
  const { data: walletClient } = useWalletClient({ chainId });
  const { chainId: userChainID, address } = useAccount();
  const publicClient = usePublicClient({ chainId });

  const requiresSwitch = chainId !== userChainID;

  const { status, updateStatus } = useAttestationStatus(
    requiresSwitch ? ProgressStatus.SWITCH_CHAIN : ProgressStatus.NOT_STARTED
  );

  const { easAddress, abi, schema } = useEASConfig(chainId);

  const { mutateAsync: switchChain } = useSwitchChain(chainId, updateStatus);

  const { mutateAsync: estimateGas } = useEstimateGas(chainId);

  const GasEstimation = useQuery({
    queryKey: ["gasEstimation", chainId, data],
    enabled: !!data && !!chainId,
    queryFn: async () => {
      return await estimateGas(data as AttestInput);
    },
  });

  const attest = useAttestMutation(
    chainId,
    address,
    walletClient,
    publicClient,
    easAddress,
    abi,
    schema,
    updateStatus,
    handleToggleModal
  );

  const handleSwitchChain = async () => {
    try {
      await switchChain();
      updateStatus(ProgressStatus.NOT_STARTED);
    } catch (error) {
      updateStatus(ProgressStatus.SWITCH_CHAIN);
    }
  };

  const handleAttest = async (data: AttestInput) => {
    try {
      updateStatus(ProgressStatus.IN_PROGRESS);
      await attest.mutateAsync(data);
      updateStatus(ProgressStatus.IS_SUCCESS);
    } catch (error) {
      updateStatus(ProgressStatus.IS_ERROR);
    }
  };

  return { status, handleSwitchChain, handleAttest, GasEstimation };
};
