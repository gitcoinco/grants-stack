import { useState } from "react";
import { Button } from "common/src/styles";
import ethereumIcon from "../../assets/icons/ethereum-icon.svg";
import processingIcon from "../../assets/processing.svg";
import warningIcon from "../../assets/warning.svg";

import { ProgressStatus } from "../../hooks/attestations/config";
import { useEASAttestation } from "../../hooks/attestations/useEASAttestation";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { useGetAttestationData } from "../../hooks/attestations/useGetAttestationData";

type MintProgressModalBodyProps = {
  handleToggleModal: () => void;
  handleGetAttestationPreview: () => Promise<string | undefined>;
};

function formatAmount(amount: bigint | undefined) {
  const formattedAmount = amount ? Number(formatEther(amount)) : 0;
  return formattedAmount.toFixed(5);
}

export function MintProgressModalBody({
  handleToggleModal,
  handleGetAttestationPreview,
}: MintProgressModalBodyProps) {
  // Update the chainId to the correct production chainId
  const chainId = 11155111;
  // Update the attestationFee to the correct production attestationFee
  const attestationFee = BigInt(0.001 * 10 ** 18);
  const { address } = useAccount();

  const { data, isLoading } = useGetAttestationData(
    ["0x1234567890"],
    handleGetAttestationPreview
  );

  const { handleAttest, handleSwitchChain, status, GasEstimation } =
    useEASAttestation(chainId, handleToggleModal, data);

  const { data: gasEstimation, isLoading: loadingGasEstimate } = GasEstimation;

  const { data: balance } = useBalance({
    chainId,
    address,
  });

  return (
    <div className="sm:w-fit md:w-[400px]">
      <div className="flex flex-col items-start justify-center">
        <div className="w-full flex flex-col items-start justify-center my-2">
          {status === ProgressStatus.IS_ERROR && (
            <div className="w-full  flex flex-col rounded-lg p-2 text-left   bg-[#FFD9CD]">
              <div className="flex flex-row items-center  justify-start ">
                <img
                  src={warningIcon}
                  alt="errorIcon"
                  className="h-4 w-4 mr-2"
                />
                <div className="text-md font-modern-era-medium">Error</div>
              </div>
              <div className="w-full flex flex-col items-start">
                <div className="text-sm font-modern-era-medium">
                  Transaction failed. Please try again.
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Additional Information */}
        <div className="w-full flex flex-wrap border rounded-lg p-3 text-left my-auto">
          <div className="w-full flex flex-wrap items-center">
            <div>
              <img src={ethereumIcon} alt="Ethereum" className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <span className="text-lg font-bold">Mainnet</span>
              <div className="text-sm font-mono">
                <span>Balance</span>
                <span className="ml-2">{`${formatAmount(balance?.value)} ETH`}</span>
              </div>
            </div>
          </div>
        </div>

        <CostDetails
          isLoading={loadingGasEstimate}
          attestationFee={attestationFee}
          estimatedGas={gasEstimation}
        />

        {status === ProgressStatus.SWITCH_CHAIN ? (
          <Button
            type="button"
            onClick={() => {
              handleSwitchChain();
            }}
            className="bg-[#DE3714] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md"
          >
            Switch Chain
          </Button>
        ) : status === ProgressStatus.NOT_STARTED ||
          status === ProgressStatus.IS_ERROR ? (
          <Button
            type="button"
            onClick={async () => {
              handleAttest(data);
            }}
            className="bg-[#00433B] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Mint"}
          </Button>
        ) : (
          status === ProgressStatus.IN_PROGRESS && (
            <Button
              type="button"
              className="bg-[#00433B] text-white w-full font-mono text-md px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-md"
            >
              <img
                src={processingIcon}
                alt="Processing Icon"
                className="w-5 h-5"
              />
              <span>Processing</span>
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export const CostDetails = ({
  attestationFee,
  estimatedGas = BigInt(0),
  isLoading,
}: {
  attestationFee: bigint;
  estimatedGas: bigint | undefined;
  isLoading: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Format the values
  const totalAmount = attestationFee + estimatedGas;
  const totalAmountFormatted = `${formatAmount(totalAmount)} ETH`;
  const attestationFeeFormatted = `${formatAmount(attestationFee)} ETH`;
  const estimatedGasFormatted = `${formatAmount(estimatedGas)} ETH`;

  const toggleDetails = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full flex flex-col mb-4 p-4 font-mono text-sm">
      {/* Toggle Button */}
      <button
        onClick={toggleDetails}
        className="flex items-center justify-between w-full focus:outline-none"
        aria-expanded={isOpen}
        aria-controls="cost-details-content"
      >
        {/* Total Cost Section */}
        <div className="flex flex-wrap gap-2">
          <span>Total Cost</span>

          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </div>

        {/* Total Cost Value */}
        <div className="flex items-center gap-2 font-medium">
          <div
            className={`transition-opacity duration-500 ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
          >
            <span>{totalAmountFormatted}</span>
          </div>
        </div>
      </button>

      {/* Collapsible Details */}
      {isOpen && (
        <div id="cost-details-content" className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span>Attest Fee</span>
            <div
              className={`transition-opacity duration-500 ${
                isLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <span>{attestationFeeFormatted}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span>Estimated Gas</span>
            <div
              className={`transition-opacity duration-500 ${
                isLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <span>{estimatedGasFormatted}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
