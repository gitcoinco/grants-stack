/* eslint-disable no-unexpected-multiline */
import { getTokenPrice, submitPassportLite } from "common";
import { useCartStorage } from "../../../store";
import { useEffect, useMemo, useState } from "react";
import { Summary } from "./Summary";
import { ProgressStatus } from "../../api/types";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button } from "common/src/styles";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { BoltIcon } from "@heroicons/react/24/outline";
import { getClassForPassportColor } from "../../api/passport";
import useSWR from "swr";
import { groupBy, uniqBy } from "lodash-es";
import { useCheckoutStore } from "../../../checkoutStore";
import { Address, parseUnits, zeroAddress } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  matchingEstimatesToText,
  useMatchingEstimates,
} from "../../../hooks/matchingEstimate";
import { Skeleton } from "@chakra-ui/react";
import { MatchingEstimateTooltip } from "../../common/MatchingEstimateTooltip";
import { parseChainId } from "common/src/chains";
import { useDataLayer } from "data-layer";
import { isPresent } from "ts-is-present";
import { getFormattedRoundId } from "../../common/utils/utils";
import { datadogLogs } from "@datadog/browser-logs";
import { PayoutModals } from "./PayoutModals";

export function SummaryContainer(props: {
  enoughBalanceByChainId: Record<number, boolean>;
  totalAmountByChainId: Record<number, number>;
  handleSwap: (chainId: number) => void;
}) {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const {
    projects,
    getVotingTokenForChain,
    remove: removeProjectFromCart,
  } = useCartStorage();
  const { voteStatus, chainsToCheckout } = useCheckoutStore();
  const dataLayer = useDataLayer();
  const { openConnectModal } = useConnectModal();

  const projectsByChain = useMemo(
    () => groupBy(projects, "chainId"),
    [projects]
  );

  const { data: rounds } = useSWR(projects, async (projects) => {
    const uniqueProjects = uniqBy(projects, (p) => `${p.chainId}-${p.roundId}`);
    return Promise.all(
      uniqueProjects.map(async (proj) => {
        const results = await dataLayer.getRoundForExplorer({
          roundId: proj.roundId,
          chainId: proj.chainId,
        });
        if (results === null) {
          return null;
        } else {
          return results.round;
        }
      })
    ).then((rounds) => rounds.filter(isPresent));
  });

  /** useEffect to clear projects from expired rounds (no longer accepting donations) */
  useEffect(() => {
    if (!rounds) {
      return;
    }
    /*get rounds that have expired */
    const expiredRounds = rounds
      .filter((round) => round.roundEndTime.getTime() < Date.now())
      .map((round) => round.id)
      .filter(isPresent);

    const expiredProjects = projects.filter((project) =>
      expiredRounds.includes(project.roundId)
    );
    expiredProjects.forEach((project) => {
      removeProjectFromCart(project);
    });
  }, [projects, removeProjectFromCart, rounds]);

  const [clickedSubmit, setClickedSubmit] = useState(false);

  useEffect(() => {
    clickedSubmit && checkEmptyDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, clickedSubmit]);

  const [emptyInput, setEmptyInput] = useState(false);
  const [openChainConfirmationModal, setOpenChainConfirmationModal] =
    useState(false);
  const [openMRCProgressModal, setOpenMRCProgressModal] = useState(false);
  /* Donate without matching warning modal */
  // const [donateWarningModalOpen, setDonateWarningModalOpen] = useState(false);

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
    const emptyDonationsExist =
      projects.filter(
        (project) => !project.amount || Number(project.amount) === 0
      ).length > 0;

    setEmptyInput(emptyDonationsExist);
    return emptyDonationsExist;
  }

  async function handleConfirmation() {
    const emptyDonations = checkEmptyDonations();
    setClickedSubmit(true);

    if (emptyDonations) {
      return;
    }

    setOpenChainConfirmationModal(true);

    // submit address to passport lite
    await submitToPassportLite();
  }

  async function submitToPassportLite() {
    const passportApiKey = process.env.REACT_APP_PASSPORT_API_KEY;
    const res = await submitPassportLite(
      address as Address,
      passportApiKey ?? ""
    );

    if (res.ok) {
      // do nothing
    } else {
      console.error("Error submitting to Passport Lite", res);
      datadogLogs.logger.error(
        `error: submitting to passsport lite - ${res}, address - ${address}`
      );
    }
  }

  const passportTextClass = getClassForPassportColor("black");

  const { data: totalDonationAcrossChainsInUSDData } = useSWR(
    props.totalAmountByChainId,
    (totalAmountByChainId) => {
      return Promise.all(
        Object.keys(totalAmountByChainId).map((chainId) => {
          const votingToken = getVotingTokenForChain(parseChainId(chainId));
          return getTokenPrice(
            votingToken.redstoneTokenId,
            votingToken.priceSource
          ).then((price) => {
            return totalAmountByChainId[Number(chainId)] * Number(price);
          });
        })
      );
    }
  );

  const totalDonationAcrossChainsInUSD = (
    totalDonationAcrossChainsInUSDData ?? []
  ).reduce((acc, curr) => acc + curr, 0);

  /* Matching estimates are calculated per-round */
  const matchingEstimateParamsPerRound =
    rounds?.map((round) => {
      const projectFromRound = projects.find(
        (project) => project.roundId === round.id
      );

      return {
        roundId: getFormattedRoundId(round.id),
        chainId: projectFromRound?.chainId ?? round.chainId ?? 1,
        potentialVotes: projects
          .filter((proj) => proj.roundId === round.id)
          .map((proj) => ({
            amount: parseUnits(
              proj.amount ?? "0",
              getVotingTokenForChain(parseChainId(proj.chainId)).decimals ?? 18
            ),
            grantAddress: proj.recipient,
            voter: address ?? zeroAddress,
            token: getVotingTokenForChain(
              parseChainId(proj.chainId)
            ).address.toLowerCase(),
            projectId: proj.projectRegistryId,
            applicationId: proj.grantApplicationId,
            roundId: getFormattedRoundId(round.id ?? zeroAddress),
          })),
      };
    }) ?? [];

  /* Filter out the chains that are not supported by the matching estimates API */
  const excludedChains = [43114, 43113];
  const filteredMatchingEstimates = matchingEstimateParamsPerRound.filter(
    (est) => !excludedChains.includes(est.chainId)
  );

  const {
    data,
    error: matchingEstimateError,
    isLoading: matchingEstimateLoading,
  } = useMatchingEstimates(filteredMatchingEstimates);

  const matchingEstimates = data?.length && data.length > 0 ? data : undefined;
  const estimate = matchingEstimatesToText(matchingEstimates);

  /** If there are no projects, render nothing */
  if (projects.length === 0) {
    return null;
  }

  const noPassportRoundsInCart =
    rounds?.filter(
      (round) => round.roundMetadata?.quadraticFundingConfig?.sybilDefense
    ).length === 0;

  return (
    <div className="block font-semibold sticky top-20">
      <div className="px-4 pt-6 pb-4 rounded-t-3xl bg-grey-50 border border-grey-50">
        <h2 className="text-2xl border-b-2 pb-2 font-bold">Summary</h2>
        <div
          className={`flex flex-row items-center justify-between mt-2 font-semibold italic ${passportTextClass}`}
        >
          {matchingEstimateError === undefined &&
            matchingEstimates !== undefined && (
              <>
                <div className="flex flex-row my-4 items-center">
                  <p className="font-bold mt-1">Estimated match</p>
                  <MatchingEstimateTooltip
                    isEligible={noPassportRoundsInCart}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Skeleton isLoaded={!matchingEstimateLoading}>
                    <p>
                      <BoltIcon className={"w-4 h-4 inline mb-1"} />
                      ~$
                      {estimate?.toFixed(2)} {}
                    </p>
                  </Skeleton>
                </div>
              </>
            )}
        </div>
        <div>
          {Object.keys(projectsByChain).map((chainId) => (
            <Summary
              key={chainId}
              chainId={parseChainId(chainId)}
              selectedPayoutToken={getVotingTokenForChain(Number(chainId))}
              enoughBalance={props.enoughBalanceByChainId[Number(chainId)]}
              totalDonation={props.totalAmountByChainId[Number(chainId)]}
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
          {emptyInput && (
            <p
              data-testid="emptyInput"
              className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
            >
              <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
              <span>You must enter donations for all the projects</span>
            </p>
          )}
        </div>
      </div>

      <Button
        // $variant="solid"
        data-testid="handle-confirmation"
        type="button"
        disabled={
          // enabled, if at least one chain has enough balance to checkout
          !Object.values(props.enoughBalanceByChainId).some((value) => value)
        }
        onClick={() => {
          /* If wallet is not connected, display Rainbowkit modal */
          if (!isConnected) {
            openConnectModal?.();
            return;
          }

          handleConfirmation();
        }}
        className={`items-center text-sm rounded-b-3xl w-full bg-blue-100 text-black py-5 text-normal font-mono`}
      >
        {isConnected ? "Submit your donation!" : "Connect wallet to continue"}
      </Button>
      <PayoutModals
        rounds={rounds}
        enoughBalanceByChainId={props.enoughBalanceByChainId}
        totalAmountByChainId={props.totalAmountByChainId}
        totalDonationAcrossChainsInUSD={totalDonationAcrossChainsInUSD}
        handleSwap={props.handleSwap}
        openChainConfirmationModal={openChainConfirmationModal}
        setOpenChainConfirmationModal={setOpenChainConfirmationModal}
        openMRCProgressModal={openMRCProgressModal}
        setOpenMRCProgressModal={setOpenMRCProgressModal}
      />
      <p className="mx-auto text-center mt-4 font-medium">
        Need to bridge funds ? Bridge funds{" "}
        <span
          className="underline cursor-pointer"
          onClick={() => props.handleSwap(42161)}
        >
          here!
        </span>
      </p>
    </div>
  );
}
