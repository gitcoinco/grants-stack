import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { AttestInput, ProgressStatus } from "./config";
import { useEASConfig } from "./useEASConfig";
import { useAttestationStatus } from "./useAttestationStatus";
import { useSwitchChain } from "./useSwitchChain";
import { useAttestMutation } from "./useAttestMutation";

/**
 * Main hook to manage EAS Attestations.
 */
export const useEASAttestation = (
  chainId: number,
  handleToggleModal: () => void,
  data: AttestInput | undefined,
  attestationFee: bigint
) => {
  const { data: walletClient } = useWalletClient({ chainId });
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId });

  const { status, updateStatus } = useAttestationStatus(chainId);

  const { easAddress, abi, schema } = useEASConfig(chainId);

  const { mutateAsync: switchChain } = useSwitchChain(chainId, updateStatus);

  const attest = useAttestMutation(
    chainId,
    address,
    walletClient,
    publicClient,
    easAddress,
    abi,
    schema,
    attestationFee,
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

  const handleAttest = async () => {
    try {
      if (!data) {
        updateStatus(ProgressStatus.IS_ERROR);
        return;
      }
      updateStatus(ProgressStatus.IN_PROGRESS);
      await attest.mutateAsync(data);
      updateStatus(ProgressStatus.IS_SUCCESS);
    } catch (error) {
      updateStatus(ProgressStatus.IS_ERROR);
    }
  };

  return { status, handleSwitchChain, handleAttest };
};
