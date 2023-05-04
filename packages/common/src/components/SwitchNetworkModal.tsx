import { BaseModal } from "./BaseModal";
import { Button, ButtonVariants } from "./Button";

export function SwitchNetworkModal({
  where,
  onSwitchNetwork,
  action,
  navigate,
}: {
  where: string;
  onSwitchNetwork: () => void;
  action?: string;
  navigate: (args: any) => void;
}) {
  return (
    <BaseModal isOpen onClose={() => {}} hideCloseButton>
      <>
        <div data-testid="switch-networks-modal" className="flex">
          <div className="text-center">
            <div data-testid="switch-networks-modal-title">
              <p className="text-primary-text text-[18px] flex justify-center p-2">
                Switch Network to Continue
              </p>
              <p className="text-gitcoin-grey-400 text-[16px] flex justify-center p-2">
                To {action || "apply for this round"} on {where}, you need to
                switch the network on your wallet.
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
            onClick={() => navigate(-1)}
            styles={["cancel-button"]}
            navigate={navigate}
          >
            <span className="inline-flex flex-1 justify-center items-center">
              Cancel
            </span>
          </Button>
          <Button
            styles={["p-3", "justify-center"]}
            onClick={onSwitchNetwork}
            variant={ButtonVariants.primary}
            navigate={navigate}
          >
            Switch Network
          </Button>
        </div>
      </>
    </BaseModal>
  );
}
