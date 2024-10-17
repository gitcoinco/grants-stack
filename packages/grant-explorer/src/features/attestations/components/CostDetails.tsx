import { useState } from "react";
import { formatAmount } from "../utils/formatAmount";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
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

  const totalAmountFormatted = `${formatAmount(attestationFee + estimatedGas)} ETH`;
  const attestationFeeFormatted = `${formatAmount(attestationFee)} ETH`;
  const estimatedGasFormatted = `${formatAmount(estimatedGas)} ETH`;

  return (
    <div className="w-full flex flex-col font-mono text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full focus:outline-none"
        aria-expanded={isOpen}
        aria-controls="cost-details-content"
      >
        <div className="flex flex-wrap gap-2">
          <span>Total Cost</span>
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </div>
        <div
          className={`transition-opacity duration-500 ${isLoading ? "opacity-50" : "opacity-100"}`}
        >
          <span>{totalAmountFormatted}</span>
        </div>
      </button>

      {isOpen && (
        <div id="cost-details-content" className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span>Attest Fee</span>
            <div
              className={`transition-opacity duration-500 ${isLoading ? "opacity-50" : "opacity-100"}`}
            >
              <span>{attestationFeeFormatted}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span>Estimated Gas</span>
            <div
              className={`transition-opacity duration-500 ${isLoading ? "opacity-50" : "opacity-100"}`}
            >
              <span>{estimatedGasFormatted}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
