import { ChainId, PassportState } from "common";
import { useCartStorage } from "../../../store";
import React, { useEffect, useMemo, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { Summary } from "./Summary";
import InfoModal from "../../common/InfoModal";
import { InfoModalBody } from "./InfoModalBody";
import ProgressModal from "../../common/ProgressModal";
import { ConfirmationModalBody } from "./ConfirmationModalBody";
import ErrorModal from "../../common/ErrorModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import ChainConfirmationModal from "../../common/ConfirmationModal";
import { ChainConfirmationModalBody } from "./ChainConfirmationModalBody";
import { CartProject, ProgressStatus } from "../../api/types";
import { useQFDonation } from "../../../context/QFDonationContext";
import { modalDelayMs } from "../../../constants";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Logger } from "ethers/lib.esm/utils";
import { datadogLogs } from "@datadog/browser-logs";
import { Button } from "common/src/styles";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { usePassport } from "../../api/passport";
import useSWR from "swr";
import _, { round } from "lodash";
import { getRoundById } from "../../api/round";
import MRCProgressModal from "../../common/MRCProgressModal";

export function SummaryContainer() {
  const { projects } = useCartStorage();
  const payoutTokens = useCartStorage((state) => state.chainToPayoutToken);
  const projectsByChain = _.groupBy(projects, "chainId") as {
    [chain: number]: CartProject[];
  };

  const { data: rounds } = useSWR(projects, (projects) => {
    const uniqueProjects = _.uniqBy(projects, "roundId");
    return Promise.all(
      uniqueProjects.map((proj) => getRoundById(proj.roundId, proj.chainId))
    );
  });

  /** The id of the round to be checked out or currently being checked out */
  const [chainIdsBeingCheckedOut, setChainIdsBeingCheckedOut] = useState<
    ChainId[]
  >([]);
  console.log("chainIdsBeingCheckedOut", chainIdsBeingCheckedOut);

  const currentPayoutToken = payoutTokens[chainIdsBeingCheckedOut[0]];

  /** We find the round that ends last, and take its end date as the permit deadline */
  const currentPermitDeadline =
    rounds
      ?.sort((a, b) => a.roundEndTime.getTime() - b.roundEndTime.getTime())[0]
      .roundEndTime.getTime() ?? 0;

  const totalDdonationsPerChain = useMemo(() => {
    return Object.fromEntries(
      Object.entries(projectsByChain).map(([key, value]) => [
        Number(key) as ChainId,
        value
          .map((project) => project.amount)
          .reduce(
            (acc, amount) =>
              acc.add(
                ethers.utils.parseUnits(
                  amount ? amount : "0",
                  payoutTokens[Number(key) as ChainId].decimal
                )
              ),
            BigNumber.from(0)
          ),
      ])
    );
  }, [projects]);

  const navigate = useNavigate();
  const { address } = useAccount();

  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [transactionReplaced, setTransactionReplaced] = useState(false);
  const [emptyInput, setEmptyInput] = useState(false);

  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openChainConfirmationModal, setOpenChainConfirmationModal] =
    useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openMRCProgressModal, setOpenMRCProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalSubHeading, setErrorModalSubHeading] = useState<
    string | undefined
  >();
  /* Donate without matching warning modal */
  const [donateWarningModalOpen, setDonateWarningModalOpen] = useState(false);

  const {
    submitDonations,
    tokenApprovalStatus,
    voteStatus,
    indexingStatus,
    txHash,
  } = useQFDonation();

  useEffect(() => {
    if (
      tokenApprovalStatus === ProgressStatus.IS_ERROR ||
      voteStatus === ProgressStatus.IS_ERROR
    ) {
      setTimeout(() => {
        setOpenMRCProgressModal(false);
        // if (transactionReplaced) {
        //   setErrorModalSubHeading("Transaction cancelled. Please try again.");
        // }
        setOpenErrorModal(true);
      }, modalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      setTimeout(() => {
        navigate(`/`);
      }, 5000);
    }

    if (
      tokenApprovalStatus === ProgressStatus.IS_SUCCESS &&
      voteStatus === ProgressStatus.IS_SUCCESS &&
      txHash !== ""
    ) {
      setTimeout(() => {
        setOpenMRCProgressModal(false);
        navigate(`/thankyou`);
      }, modalDelayMs);
    }
  }, [navigate, tokenApprovalStatus, voteStatus, indexingStatus, txHash]);

  const progressSteps = [
    {
      name: "Approve",
      description: "Approve the contract to access your wallet",
      status: tokenApprovalStatus,
    },
    {
      name: "Submit",
      description: "Finalize your contribution",
      status: voteStatus,
    },
    {
      name: "Indexing",
      description: "The subgraph is indexing the data.",
      status: indexingStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        indexingStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  function handleConfirmation() {
    // check to ensure all projects have donation amount
    const emptyDonations = projects.filter(
      (project) => !project.amount || Number(project.amount) === 0
    );

    if (emptyDonations.length > 0) {
      setEmptyInput(true);
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
              totalDdonationsPerChain={totalDdonationsPerChain}
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
          steps={progressSteps}
        />
        <ErrorModal
          isOpen={openErrorModal}
          setIsOpen={setOpenErrorModal}
          tryAgainFn={handleSubmitDonation}
          subheading={errorModalSubHeading}
        />
        {/*Passport not connected warning modal*/}
        <ErrorModal
          isOpen={donateWarningModalOpen}
          setIsOpen={setDonateWarningModalOpen}
          doneFn={() => {
            setDonateWarningModalOpen(false);
            handleConfirmation();
          }}
          tryAgainText={"Go to Passport"}
          doneText={"Donate without matching"}
          tryAgainFn={() => {
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
      if (!round) {
        throw new Error("round is null");
      }

      setTimeout(() => {
        setOpenMRCProgressModal(true);
        setOpenChainConfirmationModal(false);
      }, modalDelayMs);

      console.log(currentPayoutToken);

      await submitDonations({
        donations: projectsByChain[chainIdsBeingCheckedOut[0]],
        donationToken: currentPayoutToken,
        totalDonation: totalDdonationsPerChain[chainIdsBeingCheckedOut[0]],
        roundEndTime: currentPermitDeadline,
      });
    } catch (error) {
      if (error === Logger.errors.TRANSACTION_REPLACED) {
        setTransactionReplaced(true);
      } else {
        datadogLogs.logger.error(
          `error: handleSubmitDonation - ${error}, id: `
        );
        console.error("handleSubmitDonation - roundId", error);
      }
    }
  }

  const { passportState } = usePassport({
    address: address ?? "",
  });
  return (
    <div className="col-span-1">
      <div className="mb-5 block px-[16px] py-4 rounded-lg shadow-lg bg-white border border-violet-400 font-semibold">
        <h2 className="text-xl border-b-2 pb-2">Summary</h2>
        <div>
          {Object.keys(projectsByChain).map((chainId) => (
            <Summary
              chainId={Number(chainId) as ChainId}
              selectedPayoutToken={payoutTokens[Number(chainId) as ChainId]}
              totalDonation={totalDdonationsPerChain[chainId]}
            />
          ))}
          <Button
            $variant="solid"
            data-testid="handle-confirmation"
            type="button"
            onClick={() => {
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
            Submit your donation!
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
          {insufficientBalance && (
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
    </div>
  );
}
