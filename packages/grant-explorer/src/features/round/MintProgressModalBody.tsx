// MintProgressModalBody.tsx
import { useState } from "react";
import { ProgressStatus } from "../api/types"; // Adjust the import path as needed
import { Button } from "common/src/styles";
import ethereumIcon from "../../assets/icons/ethereum-icon.svg";
import processingIcon from "../../assets/processing.svg";

import {
  useAttest,
  useGetAttestationData,
} from "../../hooks/attestations/useAttest";

type MintProgressModalBodyProps = {
  handleToggleModal: () => void;
};

export function MintProgressModalBody({
  handleToggleModal,
}: MintProgressModalBodyProps) {
  const [status, setStatus] = useState<ProgressStatus>(
    ProgressStatus.NOT_STARTED
  );

  const { mutateAsync: attest } = useAttest(
    "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"
  );

  const { data, isLoading } = useGetAttestationData("0x1234567890");

  console.log("Attestation Data:", data);

  const startMinting = async () => {
    setStatus(ProgressStatus.IN_PROGRESS);

    await attest(data);
    setStatus(ProgressStatus.IS_SUCCESS);
    handleToggleModal();
  };

  return (
    <div className="sm:w-fit md:w-[400px]">
      <div className="flex flex-col items-center justify-center">
        {/* Step 1: Mint Your Impact */}

        {/* Additional Information */}
        <div className="w-full flex flex-wrap  border rounded-lg p-3 text-left my-auto ">
          <div className="w-full flex flex-wrap items-center">
            <div>
              <img src={ethereumIcon} alt="Ethereum" className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <span className="text-lg font-bold">Mainnet</span>
              <div className="text-sm font-mono">
                <span>Balance</span>
                <span className="ml-2">1.5 ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Details */}
        <CostDetails />

        {/* Mint Button or Success Message */}
        {status === ProgressStatus.NOT_STARTED ? (
          <Button
            type="button"
            onClick={async () => {
              startMinting();
            }}
            className="bg-[#00433B] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md"
            disabled={isLoading}
          >
            {isLoading ? "Loading" : "Mint"}
          </Button>
        ) : status === ProgressStatus.IN_PROGRESS ? (
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
        ) : status === ProgressStatus.IS_ERROR ? (
          <Button
            type="button"
            className="bg-red-500 text-white font-mono text-lg px-4 py-2 rounded hover:shadow-md"
          >
            Error Occurred
          </Button>
        ) : (
          <Button
            type="button"
            className="bg-[#00433B] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md"
          >
            Minted Successfully{" "}
          </Button>
        )}
      </div>
    </div>
  );
}

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export function CostDetails() {
  const [isOpen, setIsOpen] = useState(false);

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

        {/* Chevron Icon */}
        <div className="flex items-center gap-2 font-medium">
          <span>0.05 ETH</span>
        </div>
      </button>

      {/* Collapsible Details */}
      {isOpen && (
        <div id="cost-details-content" className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span>Attest Fee:</span>
            <span>0.01 ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Gas:</span>
            <span>0.02 ETH</span>
          </div>
        </div>
      )}
    </div>
  );
}
