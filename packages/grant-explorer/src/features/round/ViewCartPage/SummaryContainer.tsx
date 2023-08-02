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
import { useRoundById } from "../../../context/RoundContext";
import { CartProject, PayoutToken, ProgressStatus } from "../../api/types";
import { useQFDonation } from "../../../context/QFDonationContext";
import { modalDelayMs } from "../../../constants";
import { useNavigate } from "react-router-dom";
import { useAccount, useBalance } from "wagmi";
import { Logger } from "ethers/lib.esm/utils";
import { datadogLogs } from "@datadog/browser-logs";
import { Button } from "common/src/styles";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { usePassport } from "../../api/passport";
import useSWR from "swr";
import { round } from "lodash";
import { getRoundById } from "../../api/round";

export function SummaryContainer(props: {
  chainId: ChainId;
  payoutToken: PayoutToken;
  payoutTokenPrice?: number;
}) {
  const projects = useCartStorage((state) =>
    state.projects.filter((p) => p.chainId === props.chainId)
  );

  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalSubHeading, setErrorModalSubHeading] = useState<
    string | undefined
  >();
  /* Donate without matching warning modal */
  const [donateWarningModalOpen, setDonateWarningModalOpen] = useState(false);

  const totalDonation = useMemo(() => {
    return projects.reduce((acc, donation) => {
      return acc.add(
        ethers.utils.parseUnits(
          donation.amount ? donation.amount : "0",
          props.payoutToken.decimal
        )
      );
    }, BigNumber.from(0));
  }, [projects, props.payoutToken.decimal]);

  const navigate = useNavigate();

  const { address } = useAccount();
  const tokenDetail =
    props.payoutToken.address == ethers.constants.AddressZero
      ? { address: address }
      : { address: address, token: props.payoutToken.address };
  // @ts-expect-error Temp until viem
  const selectedPayoutTokenBalance = useBalance(tokenDetail);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [transactionReplaced, setTransactionReplaced] = useState(false);

  const [emptyInput, setEmptyInput] = useState(false);

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
        setOpenProgressModal(false);
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
        setOpenProgressModal(false);
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

    // check if signer has enough token balance
    const accountBalance = selectedPayoutTokenBalance.data?.value;

    if (!accountBalance || totalDonation.gt(accountBalance)) {
      setInsufficientBalance(true);
      return;
    } else {
      setInsufficientBalance(false);
    }

    setOpenConfirmationModal(true);
  }

  function PayoutModals() {
    return (
      <>
        <ConfirmationModal
          title={"Confirm Decision"}
          confirmButtonText={"Confirm"}
          confirmButtonAction={() => {
            setOpenInfoModal(true);
            setOpenConfirmationModal(false);
          }}
          body={
            <ConfirmationModalBody
              projectsCount={projects.length}
              selectedPayoutToken={props.payoutToken}
              totalDonation={totalDonation}
            />
          }
          isOpen={openConfirmationModal}
          setIsOpen={setOpenConfirmationModal}
        />
        <InfoModal
          title={"Heads up!"}
          body={<InfoModalBody />}
          isOpen={openInfoModal}
          setIsOpen={setOpenInfoModal}
          continueButtonAction={handleSubmitDonation}
        />
        <ProgressModal
          isOpen={openProgressModal}
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
        setOpenProgressModal(true);
        setOpenInfoModal(false);
      }, modalDelayMs);

      const bigNumberDonation = projects.map((donation) => {
        console.log(donation);
        return {
          ...donation,
          amount: ethers.utils.parseUnits(
            donation.amount,
            props.payoutToken.decimal
          ),
        };
      });

      console.log(bigNumberDonation);

      await submitDonations({
        donations: bigNumberDonation,
        donationToken: props.payoutToken,
        totalDonation: totalDonation,
        roundEndTime: round?.round?.roundEndTime.getTime() ?? 0,
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
    <div className="order-first md:order-last">
      <div>
        <Summary
          payoutTokenPrice={props.payoutTokenPrice ?? 0}
          selectedPayoutToken={props.payoutToken}
          totalDonation={totalDonation}
        />
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
          className="items-center shadow-sm text-sm rounded w-full"
        >
          Submit your donation!
        </Button>
        {round.round?.roundMetadata?.quadraticFundingConfig
          ?.minDonationThresholdAmount && (
          <p className="flex justify-center my-4 text-sm italic">
            Your donation to each project must be valued at{" "}
            {
              round.round?.roundMetadata?.quadraticFundingConfig
                ?.minDonationThresholdAmount
            }{" "}
            USD or more to be eligible for matching.
          </p>
        )}
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
  );
}
