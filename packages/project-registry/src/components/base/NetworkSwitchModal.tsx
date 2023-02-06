// import colors from "../../styles/colors";
import { useMemo } from "react";
import { useSwitchNetwork } from "wagmi";
import { BaseModal } from "./BaseModal";
import Button, { ButtonVariants } from "./Button";

interface NetworkSwitchModalProps {
  modalOpen: boolean;
  networkId?: number;
  toggleModal: (status: boolean) => void;
  onSwitch?: (networkId?: number) => void;
}

export default function NetworkSwitchModal({
  modalOpen,
  networkId,
  toggleModal,
  onSwitch,
}: NetworkSwitchModalProps) {
  const { chains, switchNetworkAsync } = useSwitchNetwork();

  const networkName = useMemo(
    () => chains.find((i) => i.id === networkId)?.name as string,
    [networkId, chains]
  );

  const handleNetworkSwitch = async () => {
    if (switchNetworkAsync) {
      await switchNetworkAsync(networkId);
      if (onSwitch) {
        onSwitch(networkId);
      }
    }
  };

  return (
    <BaseModal
      isOpen={modalOpen}
      size="md"
      onClose={() => toggleModal(false)}
      hideCloseButton
    >
      <section className="w-full" data-testid="network-switch-modal">
        <div className="flex">
          <div className="w-full text-center">
            <h5 className="font-semibold mb-2">Switch Networks to Continue</h5>
            <p className="mb-6">
              To create a project on {networkName}, you need to switch networks
              on your wallet.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={ButtonVariants.outline}
            onClick={() => toggleModal(false)}
            styles={["cancel-button"]}
          >
            <span className="inline-flex flex-1 justify-center items-center">
              Cancel
            </span>
          </Button>
          <Button
            onClick={handleNetworkSwitch}
            variant={ButtonVariants.primary}
            styles={["switch-button"]}
          >
            <span className="inline-flex flex-1 justify-center items-center">
              Switch Network
            </span>
          </Button>
        </div>
      </section>
    </BaseModal>
  );
}
