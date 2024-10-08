import { Button } from "common/src/styles";
import processingIcon from "../../../assets/processing.svg";
import { ProgressStatus } from "../../../hooks/attestations/config";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Extracted ActionButton component
export const ActionButton = ({
  isConnected,
  status,
  handleSwitchChain,
  handleAttest,
  notEnoughFunds,
  isLoading,
}: {
  isConnected: boolean;
  status: ProgressStatus;
  handleSwitchChain: () => Promise<void>;
  handleAttest: () => Promise<void>;
  notEnoughFunds: boolean;
  isLoading: boolean;
}) => {
  if (!isConnected) {
    return (
      <Button className="bg-[#DE3714] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md">
        <ConnectButton />
      </Button>
    );
  } else if (status === ProgressStatus.SWITCH_CHAIN) {
    return (
      <Button
        onClick={handleSwitchChain}
        className="bg-[#DE3714] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md"
      >
        Switch Chain
      </Button>
    );
  } else if (notEnoughFunds) {
    return (
      <div className="w-full flex flex-col items-start gap-3">
        <span className="p-2 text-sm font-modern-era-medium">
          Insufficient funds to complete the minting process. Please bridge or
          add funds to your wallet to proceed.
        </span>
        <Button className="bg-[#DE3714] text-white font-mono text-md w-full px-4 pb-2 rounded-lg hover:shadow-md">
          Bridge Funds
        </Button>
      </div>
    );
  } else if (
    status === ProgressStatus.NOT_STARTED ||
    status === ProgressStatus.IS_ERROR
  ) {
    return (
      <Button
        onClick={handleAttest}
        className="bg-[#00433B] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Mint"}
      </Button>
    );
  } else if (status === ProgressStatus.IN_PROGRESS) {
    return (
      <Button className="bg-[#00433B] text-white w-full font-mono text-md px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-md">
        <img
          src={processingIcon}
          alt="Processing Icon"
          className="w-5 h-5 animate-reverse-spin"
        />
        <span>Processing</span>
      </Button>
    );
  } else {
    return null;
  }
};
