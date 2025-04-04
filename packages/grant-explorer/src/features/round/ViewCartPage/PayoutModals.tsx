/* eslint-disable no-unexpected-multiline */
import { useCartStorage } from "../../../store";
import { useMemo, useState } from "react";
import ChainConfirmationModal from "../../common/ConfirmationModal";
import { ChainConfirmationModalBody } from "./ChainConfirmationModalBody";
import { modalDelayMs } from "../../../constants";
import { useAccount, useWalletClient } from "wagmi";
import { groupBy } from "lodash-es";
import MRCProgressModal from "../../common/MRCProgressModal";
import { MRCProgressModalBody } from "./MRCProgressModalBody";
import { useCheckoutStore } from "../../../checkoutStore";
import { Round } from "data-layer";
import {
  getGitcoinRecipientData,
  useDonateToGitcoin,
} from "../DonateToGitcoinContext";
import { Hex } from "viem";

export function PayoutModals({
  openChainConfirmationModal,
  setOpenChainConfirmationModal,
  openMRCProgressModal,
  setOpenMRCProgressModal,
  rounds,
  enoughBalanceByChainId,
  totalAmountByChainId,
  handleSwap,
  totalDonationAcrossChainsInUSD,
}: {
  openChainConfirmationModal: boolean;
  setOpenChainConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
  openMRCProgressModal: boolean;
  setOpenMRCProgressModal: React.Dispatch<React.SetStateAction<boolean>>;
  rounds?: Round[];
  enoughBalanceByChainId: Record<number, boolean>;
  totalAmountByChainId: Record<number, number>;
  handleSwap: (chainId: number) => void;
  totalDonationAcrossChainsInUSD: number;
}) {
  const {
    selectedChainId,
    selectedToken,
    directAllocationPoolId,
    amountInWei,
  } = useDonateToGitcoin();

  const { data: walletClient } = useWalletClient();
  const { connector } = useAccount();
  const { checkout } = useCheckoutStore();
  const { projects } = useCartStorage();
  const projectsByChain = useMemo(
    () => groupBy(projects, "chainId"),
    [projects]
  );
  /** The ids of the chains that will be checked out */
  const [chainIdsBeingCheckedOut, setChainIdsBeingCheckedOut] = useState<
    number[]
  >(Object.keys(projectsByChain).map(Number));

  const cancelButtonAction = () => {
    setOpenChainConfirmationModal(false);
    setChainIdsBeingCheckedOut(Object.keys(projectsByChain).map(Number));
  };

  /** We find the round that ends last, and take its end date as the permit deadline */
  const currentPermitDeadline =
    rounds && rounds.length > 0
      ? [...rounds]
          .sort((a, b) => a.roundEndTime.getTime() - b.roundEndTime.getTime())
          [rounds.length - 1].roundEndTime.getTime()
      : 0;

  async function handleSubmitDonation() {
    try {
      if (!walletClient || !connector) {
        console.error("Wallet client or Connector not available");
        return;
      }

      setTimeout(() => {
        setOpenMRCProgressModal(true);
        setOpenChainConfirmationModal(false);
      }, modalDelayMs);

      await checkout(
        chainIdsBeingCheckedOut
          .filter((chainId) => enoughBalanceByChainId[chainId] === true)
          .map((chainId) => ({
            chainId,
            permitDeadline: currentPermitDeadline,
          })),
        walletClient,
        connector,
        selectedChainId &&
          selectedToken &&
          directAllocationPoolId &&
          amountInWei
          ? {
              chainId: selectedChainId as number,
              tokenAddress: selectedToken as Hex,
              poolId: directAllocationPoolId.toString(),
              amount: amountInWei,
              recipient: getGitcoinRecipientData(selectedChainId as number)
                .recipient,
              nonce: getGitcoinRecipientData(selectedChainId as number).nonce,
            }
          : undefined
      );
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      <ChainConfirmationModal
        title={"Checkout"}
        confirmButtonText={"Checkout"}
        confirmButtonAction={handleSubmitDonation}
        cancelButtonAction={cancelButtonAction}
        body={
          <ChainConfirmationModalBody
            projectsByChain={projectsByChain}
            totalDonationsPerChain={totalAmountByChainId}
            chainIdsBeingCheckedOut={chainIdsBeingCheckedOut}
            setChainIdsBeingCheckedOut={setChainIdsBeingCheckedOut}
            enoughBalanceByChainId={enoughBalanceByChainId}
            handleSwap={handleSwap}
            totalDonationAcrossChainsInUSD={totalDonationAcrossChainsInUSD}
          />
        }
        isOpen={openChainConfirmationModal}
        setIsOpen={setOpenChainConfirmationModal}
        disabled={chainIdsBeingCheckedOut.length === 0}
      />
      <MRCProgressModal
        isOpen={openMRCProgressModal}
        subheading={"Please hold while we submit your donation."}
        body={
          <MRCProgressModalBody
            chainIdsBeingCheckedOut={chainIdsBeingCheckedOut.filter(
              (chainId) => enoughBalanceByChainId[chainId] === true
            )}
            tryAgainFn={handleSubmitDonation}
            setIsOpen={setOpenMRCProgressModal}
          />
        }
      />
      {/*Passport not connected warning modal*/}
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
          heading={`Don't miss out on getting your donations matched!`}
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
