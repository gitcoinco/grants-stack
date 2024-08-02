import { BaseModal } from "./BaseModal";
import Button, { ButtonVariants } from "./Button";

function SwitchNetworkModal({
  networkName,
  onSwitchNetwork,
  action,
  isOpen,
  setIsOpen,
}: {
  networkName: string;
  onSwitchNetwork: () => void;
  action?: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <BaseModal isOpen={isOpen} onClose={() => {}} hideCloseButton>
      <>
        <div data-testid="switch-networks-modal" className="flex">
          <div className="text-center">
            <div data-testid="switch-networks-modal-title">
              <p className="text-primary-text text-[18px] flex justify-center p-2">
                Switch Networks to Continue
              </p>
              <p className="text-gitcoin-grey-400 text-[16px] flex justify-center p-2">
                To {action || "donate"}, you need to switch the network on your
                wallet to {networkName}.
              </p>
            </div>
          </div>
        </div>
        <div
          data-testid="switch-networks-modal-button"
          className="w-full justify-center text-center grid grid-cols-2 gap-3"
        >
          <Button
            variant={ButtonVariants.outline}
            onClick={() => setIsOpen(false)}
            styles={["cancel-button"]}
          >
            <span className="inline-flex flex-1 justify-center items-center">
              Cancel
            </span>
          </Button>
          <Button
            styles={["p-3", "justify-center"]}
            onClick={onSwitchNetwork}
            variant={ButtonVariants.outline}
          >
            Switch Network
          </Button>
        </div>
      </>
    </BaseModal>
  );
}

export default SwitchNetworkModal;
