import React from "react";
import { CartProject } from "../../api/types";
import { TToken, getChainById, stringToBlobUrl } from "common";
import { useCartStorage } from "../../../store";
import { parseChainId } from "common/src/chains";
import { Checkbox } from "@chakra-ui/react";

type ChainConfirmationModalBodyProps = {
  projectsByChain: { [chain: number]: CartProject[] };
  totalDonationsPerChain: { [chain: number]: number };
  chainIdsBeingCheckedOut: number[];
  enoughBalanceByChainId: Record<number, boolean>;
  setChainIdsBeingCheckedOut: React.Dispatch<React.SetStateAction<number[]>>;
  handleSwap: (chainId: number) => void;
  showNetworkMessage: boolean; // Add showNetworkMessage to props
};

export function ChainConfirmationModalBody({
  projectsByChain,
  totalDonationsPerChain,
  chainIdsBeingCheckedOut,
  enoughBalanceByChainId,
  setChainIdsBeingCheckedOut,
  handleSwap,
  showNetworkMessage, // Accept showNetworkMessage as a prop
}: ChainConfirmationModalBodyProps) {
  const handleChainCheckboxChange = (chainId: number, checked: boolean) => {
    if (checked) {
      setChainIdsBeingCheckedOut((prevChainIds) =>
        prevChainIds.includes(chainId)
          ? prevChainIds
          : [...prevChainIds, chainId]
      );
    } else {
      setChainIdsBeingCheckedOut((prevChainIds) =>
        prevChainIds.filter((id) => id !== chainId)
      );
    }
  };

  const getVotingTokenForChain = useCartStorage(
    (state) => state.getVotingTokenForChain
  );

  return (
    <>
      {/* Conditionally render the message based on showNetworkMessage */}
      {showNetworkMessage && (
        <p className="text-sm text-grey-400">
          Checkout all your carts across different networks or select the cart you
          wish to checkout now.
        </p>
      )}
      <div className="my-4">
        {Object.keys(projectsByChain)
          .map(parseChainId)
          .filter((chainId) => chainIdsBeingCheckedOut.includes(chainId))
          .map((chainId, index) => (
            <ChainSummary
              chainId={chainId}
              selectedPayoutToken={getVotingTokenForChain(chainId)}
              totalDonation={totalDonationsPerChain[chainId]}
              checked={
                chainIdsBeingCheckedOut.includes(chainId) &&
                enoughBalanceByChainId[chainId]
              }
              chainsBeingCheckedOut={chainIdsBeingCheckedOut.length}
              onChange={(checked) =>
                handleChainCheckboxChange(chainId, checked)
              }
              isLastItem={index === Object.keys(projectsByChain).length - 1}
              notEnoughBalance={!enoughBalanceByChainId[chainId]}
              handleSwap={() => handleSwap(chainId)}
            />
          ))}
      </div>
      {/* Passport not connected warning modal */}
      {/* <ErrorModal
        isOpen={donateWarningModalOpen}
        setIsOpen={setDonateWarningModalOpen}
        onDone={() => {
          setDonateWarningModalOpen(false);
          handleConfirmation();
        }}
        tryAgainText={"Go to Passport"}
        doneText={"Donate without matching"}
        onTryAgain={() => {
          window.location.href = "https://passport.gitcoin.co";
        }}
        heading={`Don’t miss out on getting your donations matched!`}
        subheading={
          <>
            <p className={"text-sm text-grey-400 mb-2"}>
              Verify your identity with Gitcoin Passport to amplify your
              donations.
            </p>
            <p className={"text-sm text-grey-400"}>
              Note that donations made without Gitcoin Passport verification
              will not be matched.
            </p>
          </>
        }
        closeOnBackgroundClick={true}
      /> */}
    </>
  );
}

type ChainSummaryProps = {
  totalDonation: number;
  selectedPayoutToken: TToken;
  chainId: number;
  checked: boolean;
  chainsBeingCheckedOut: number;
  notEnoughBalance: boolean;
  onChange: (checked: boolean) => void;
  isLastItem: boolean;
  handleSwap: () => void;
};

export function ChainSummary({
  selectedPayoutToken,
  totalDonation,
  chainId,
  checked,
  chainsBeingCheckedOut,
  notEnoughBalance,
  onChange,
  isLastItem,
  handleSwap,
}: ChainSummaryProps) {
  const chain = getChainById(chainId);

  return (
    <div
      className={`flex flex-col justify-center mt-2 ${
        isLastItem ? "" : "border-b"
      } py-4`}
    >
      <div className={`${notEnoughBalance ? "opacity-50" : ""}`}>
        <p className="font-sans font-medium">
          <Checkbox
            className={`mr-2 mt-1  ${
              chainsBeingCheckedOut === 1 ? "invisible" : ""
            }`}
            border={"1px"}
            borderRadius={"4px"}
            colorScheme="whiteAlpha"
            iconColor="black"
            size="lg"
            isChecked={checked}
            disabled={chainsBeingCheckedOut === 1 || notEnoughBalance}
            onChange={(e) => onChange(e.target.checked)}
          />
          <img
            className="inline mr-2 w-5 h-5"
            alt={chain.prettyName}
            src={stringToBlobUrl(chain.icon)}
          />
          <span className="font-sans font-medium">
            Checkout {chain.prettyName} cart
          </span>
        </p>
        <p className="ml-7 mt-2">
          <span data-testid={"totalDonation"} className="mr-2">
            {totalDonation}
          </span>
          <span data-testid={"chainSummaryPayoutToken"}>
            {selectedPayoutToken.code} to be contributed
          </span>
        </p>
      </div>
      {notEnoughBalance && (
        <div className="text-red-500 flex items-center text-sm">
          <p>
            There are insufficient funds in your wallet to complete your full
            donation. Please{" "}
            <span
              onClick={() => handleSwap()}
              className="cursor-pointer underline"
            >
              bridge
            </span>{" "}
            funds over to {getChainById(chainId).prettyName}.
          </p>
        </div>
      )}
    </div>
  );
}
