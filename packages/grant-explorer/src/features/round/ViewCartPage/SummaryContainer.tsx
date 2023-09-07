import { ChainId, PassportState, getTokenPrice } from "common";
import { useCartStorage } from "../../../store";
import React, { useEffect, useMemo, useState } from "react";
import { Summary } from "./Summary";
import ErrorModal from "../../common/ErrorModal";
import ChainConfirmationModal from "../../common/ConfirmationModal";
import { ChainConfirmationModalBody } from "./ChainConfirmationModalBody";
import { ProgressStatus } from "../../api/types";
import { modalDelayMs } from "../../../constants";
import { useNavigate } from "react-router-dom";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { Button } from "common/src/styles";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { usePassport } from "../../api/passport";
import useSWR from "swr";
import { round, groupBy, uniqBy } from "lodash-es";
import { getRoundById } from "../../api/round";
import MRCProgressModal from "../../common/MRCProgressModal";
import { MRCProgressModalBody } from "./MRCProgressModalBody";
import { useCheckoutStore } from "../../../checkoutStore";
import { formatUnits, parseUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function SummaryContainer() {
  const { projects, chainToPayoutToken: payoutTokens } = useCartStorage();
  const { checkout, voteStatus, chainsToCheckout } = useCheckoutStore();

  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const projectsByChain = useMemo(
    () => groupBy(projects, "chainId"),
    [projects]
  );

  const { data: rounds } = useSWR(projects, (projects) => {
    const uniqueProjects = uniqBy(projects, "roundId");
    return Promise.all(
      uniqueProjects.map((proj) => getRoundById(proj.roundId, proj.chainId))
    );
  });

  const [clickedSubmit, setClickedSubmit] = useState(false);

  useEffect(() => {
    clickedSubmit && checkEmptyDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, clickedSubmit]);

  /** The ids of the chains that will be checked out */
  const [chainIdsBeingCheckedOut, setChainIdsBeingCheckedOut] = useState<
    ChainId[]
  >(Object.keys(projectsByChain).map(Number));

  /** Keep the chains to be checked out in sync with the projects in the cart */
  useEffect(() => {
    const chainIdsFromProjects = Object.keys(projectsByChain).map(Number);
    if (chainIdsFromProjects.length < chainIdsBeingCheckedOut.length) {
      setChainIdsBeingCheckedOut(chainIdsFromProjects);
    }
  }, [chainIdsBeingCheckedOut, projectsByChain]);

  /** The ID of the current chain (from wallet) */
  const { data: walletClient } = useWalletClient();

  /** We find the round that ends last, and take its end date as the permit deadline */
  const currentPermitDeadline =
    rounds && rounds.length > 0
      ? [...rounds]
          .sort(
            (a, b) => a.roundEndTime.getTime() - b.roundEndTime.getTime()
          )[0]
          .roundEndTime.getTime()
      : 0;

  const totalDonationsPerChain = useMemo(() => {
    return Object.fromEntries(
      Object.entries(projectsByChain).map(([key, value]) => [
        Number(key) as ChainId,
        value
          .map((project) => project.amount)
          .reduce(
            (acc, amount) =>
              acc +
              parseUnits(
                amount ? amount : "0",
                payoutTokens[Number(key) as ChainId]?.decimal
              ),
            0n
          ),
      ])
    );
  }, [payoutTokens, projectsByChain]);

  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  const [emptyInput, setEmptyInput] = useState(false);
  const [openChainConfirmationModal, setOpenChainConfirmationModal] =
    useState(false);

  const [openMRCProgressModal, setOpenMRCProgressModal] = useState(false);

  /* Donate without matching warning modal */
  const [donateWarningModalOpen, setDonateWarningModalOpen] = useState(false);

  useEffect(() => {
    /* Check if all chains that were meant to be checked out were succesful */
    const success = chainsToCheckout
      .map((chain) => voteStatus[chain])
      .every((status) => status === ProgressStatus.IS_SUCCESS);
    /* Redirect to thank you page */
    if (success && chainsToCheckout.length > 0) {
      navigate("/thankyou");
    }
  }, [chainsToCheckout, navigate, voteStatus]);

  function checkEmptyDonations() {
    const emptyDonations = projects.filter(
      (project) => !project.amount || Number(project.amount) === 0
    );

    if (emptyDonations.length > 0) {
      setEmptyInput(true);
      return true;
    } else {
      setEmptyInput(false);
      return false;
    }
  }

  function handleConfirmation() {
    const emptyDonations = checkEmptyDonations();
    setClickedSubmit(true);

    if (emptyDonations) {
      return;
    }

    // TODO: check if signer has enough token balance for the current round
    // const accountBalance = rounds.find();
    //
    // if (!accountBalance || totalDonation.gt(accountBalance)) {
    //   setInsufficientBalance(true);
    //   return;
    // }

    setOpenChainConfirmationModal(true);
  }

  function PayoutModals() {
    return (
      <>
        <ChainConfirmationModal
          title={"Checkout"}
          confirmButtonText={"Checkout"}
          confirmButtonAction={handleSubmitDonation}
          body={
            <ChainConfirmationModalBody
              projectsByChain={projectsByChain}
              totalDonationsPerChain={totalDonationsPerChain}
              chainIdsBeingCheckedOut={chainIdsBeingCheckedOut}
              setChainIdsBeingCheckedOut={setChainIdsBeingCheckedOut}
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
              chainIdsBeingCheckedOut={chainIdsBeingCheckedOut}
              tryAgainFn={handleSubmitDonation}
              setIsOpen={setOpenMRCProgressModal}
            />
          }
        />
        {/*Passport not connected warning modal*/}
        <ErrorModal
          isOpen={donateWarningModalOpen}
          setIsOpen={setDonateWarningModalOpen}
          onDone={() => {
            setDonateWarningModalOpen(false);
            handleConfirmation();
          }}
          tryAgainText={"Go to Passport"}
          doneText={"Donate without matching"}
          onTryAgain={() => {
            navigate(`/round/passport/connect`);
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
        />
      </>
    );
  }

  async function handleSubmitDonation() {
    try {
      if (!round || !walletClient) {
        return;
      }

      setTimeout(() => {
        setOpenMRCProgressModal(true);
        setOpenChainConfirmationModal(false);
      }, modalDelayMs);

      await checkout(
        chainIdsBeingCheckedOut.map((chainId) => ({
          chainId,
          permitDeadline: currentPermitDeadline,
        })),
        walletClient,
        publicClient
      );
    } catch (error) {
      console.error(error);
    }
  }

  const { passportState } = usePassport({
    address: address ?? "",
  });

  const [totalDonationAcrossChainsInUSD, setTotalDonationAcrossChainsInUSD] =
    useState<number | undefined>();

  const { data: totalDonationAcrossChainsInUSDData } = useSWR(
    totalDonationsPerChain,
    (totalDonationsPerChain) => {
      return Promise.all(
        Object.keys(totalDonationsPerChain).map((chainId) =>
          getTokenPrice(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            payoutTokens[Number(chainId) as ChainId].redstoneTokenId!
          ).then((price) => {
            return (
              Number(
                formatUnits(
                  totalDonationsPerChain[chainId],
                  payoutTokens[Number(chainId) as ChainId].decimal
                )
              ) * Number(price)
            );
          })
        )
      );
    }
  );

  /*TODO: this can be a variable */
  useEffect(() => {
    if (totalDonationAcrossChainsInUSDData) {
      setTotalDonationAcrossChainsInUSD(
        totalDonationAcrossChainsInUSDData.reduce((acc, curr) => acc + curr, 0)
      );
    }
  }, [totalDonationAcrossChainsInUSDData]);

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 block px-[16px] py-4 rounded-lg shadow-lg bg-white border border-violet-400 font-semibold">
      <h2 className="text-xl border-b-2 pb-2">Summary</h2>
      <div>
        {Object.keys(projectsByChain).map((chainId) => (
          <Summary
            key={chainId}
            chainId={Number(chainId) as ChainId}
            selectedPayoutToken={payoutTokens[Number(chainId) as ChainId]}
            totalDonation={totalDonationsPerChain[chainId]}
          />
        ))}
        {totalDonationAcrossChainsInUSD &&
        totalDonationAcrossChainsInUSD > 0 ? (
          <div className="flex flex-row justify-between mt-4 border-t-2">
            <div className="flex flex-col mt-4">
              <p className="mb-2">Your total contribution</p>
            </div>
            <div className="flex justify-end mt-4">
              <p>$ {totalDonationAcrossChainsInUSD?.toFixed(2)}</p>
            </div>
          </div>
        ) : null}
        <Button
          $variant="solid"
          data-testid="handle-confirmation"
          type="button"
          onClick={() => {
            /* If wallet is not connected, display Rainbowkit modal */
            if (!isConnected) {
              openConnectModal?.();
              return;
            }

            /* Check if user hasn't connected passport yet, display the warning modal */
            if (
              passportState === PassportState.ERROR ||
              passportState === PassportState.NOT_CONNECTED ||
              passportState === PassportState.INVALID_PASSPORT
            ) {
              setDonateWarningModalOpen(true);
              return;
            }

            /* If passport is fine, proceed straight to confirmation */
            handleConfirmation();
          }}
          className="items-center shadow-sm text-sm rounded w-full mt-4"
        >
          {isConnected ? "Submit your donation!" : "Connect wallet to continue"}
        </Button>
        {/*{round.round?.roundMetadata?.quadraticFundingConfig*/}
        {/*  ?.minDonationThresholdAmount && (*/}
        {/*  <p className="flex justify-center my-4 text-sm italic">*/}
        {/*    Your donation to each project must be valued at{" "}*/}
        {/*    {*/}
        {/*      round.round?.roundMetadata?.quadraticFundingConfig*/}
        {/*        ?.minDonationThresholdAmount*/}
        {/*    }{" "}*/}
        {/*    USD or more to be eligible for matching.*/}
        {/*  </p>*/}
        {/*)}*/}
        {emptyInput && (
          <p
            data-testid="emptyInput"
            className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
          >
            <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
            <span>You must enter donations for all the projects</span>
          </p>
        )}
        {/*TODO: insufficient balance check*/}
        {false && (
          <p
            data-testid="insufficientBalance"
            className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
          >
            <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
            <span>You do not have enough funds for these donations</span>
          </p>
        )}
      </div>
      <PayoutModals />
    </div>
  );
}
