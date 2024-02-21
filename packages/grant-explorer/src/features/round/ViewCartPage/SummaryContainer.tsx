import { ChainId, getTokenPrice, PassportState } from "common";
import { useCartStorage } from "../../../store";
import React, { useEffect, useMemo, useState } from "react";
import { Summary } from "./Summary";
import ErrorModal from "../../common/ErrorModal";
import ChainConfirmationModal from "../../common/ConfirmationModal";
import { ChainConfirmationModalBody } from "./ChainConfirmationModalBody";
import { ProgressStatus } from "../../api/types";
import { modalDelayMs } from "../../../constants";
import { useNavigate } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "common/src/styles";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { BoltIcon } from "@heroicons/react/24/outline";

import { getClassForPassportColor, usePassport } from "../../api/passport";
import useSWR from "swr";
import { groupBy, uniqBy } from "lodash-es";
import MRCProgressModal from "../../common/MRCProgressModal";
import { MRCProgressModalBody } from "./MRCProgressModalBody";
import { useCheckoutStore } from "../../../checkoutStore";
import { formatUnits, getAddress, parseUnits, zeroAddress } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  matchingEstimatesToText,
  useMatchingEstimates,
} from "../../../hooks/matchingEstimate";
import { Skeleton } from "@chakra-ui/react";
import { MatchingEstimateTooltip } from "../../common/MatchingEstimateTooltip";
import { parseChainId } from "common/src/chains";
import { useDataLayer } from "data-layer";
import { fetchBalance } from "@wagmi/core";
import { isPresent } from "ts-is-present";
import { useAllo } from "../../api/AlloWrapper";

export function SummaryContainer() {
  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const {
    projects,
    getVotingTokenForChain,
    chainToVotingToken,
    remove: removeProjectFromCart,
  } = useCartStorage();
  const { checkout, voteStatus, chainsToCheckout } = useCheckoutStore();
  const dataLayer = useDataLayer();

  const { openConnectModal } = useConnectModal();
  const allo = useAllo();
  const projectsByChain = useMemo(
    () => groupBy(projects, "chainId"),
    [projects]
  );

  /*  This needs to be a useMemo to prevent an infinite loop in the below useEffect */
  /* TODO: can we remove the useMemo without causing an infinite loop? */
  const chainIds = useMemo(
    () => Object.keys(projectsByChain).map(Number),
    [projectsByChain]
  );

  /** How much of the voting token for a chain does the address have*/
  const [tokenBalancesPerChain, setTokenBalancesPerChain] = useState<
    Map<ChainId, bigint>
  >(new Map());
  useEffect(() => {
    const runner = async () => {
      const newMap = new Map(tokenBalancesPerChain);
      await Promise.all(
        chainIds.map(async (chainId) => {
          const votingToken = getVotingTokenForChain(chainId);
          const { value } = await fetchBalance({
            address: address ?? zeroAddress,
            token:
              votingToken.address === zeroAddress
                ? undefined
                : votingToken.address,
            chainId,
          });
          newMap.set(chainId, value);
        })
      );
      setTokenBalancesPerChain(newMap);
    };
    runner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainIds, getVotingTokenForChain]);

  const totalDonationsPerChain = useMemo(() => {
    return Object.fromEntries(
      Object.entries(projectsByChain).map(([key, value]) => [
        parseChainId(key),
        value
          .map((project) => project.amount)
          .reduce(
            (acc, amount) =>
              acc +
              parseUnits(
                amount ? amount : "0",
                getVotingTokenForChain(parseChainId(key)).decimal
              ),
            0n
          ),
      ])
    );
    /* NB: we want to update the totalDonationsPerChain value based on chainToVotingToken */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getVotingTokenForChain, chainToVotingToken, projectsByChain]);

  const enoughFundsToDonatePerChain = useMemo(() => {
    return Object.fromEntries(
      chainIds.map((chainId) => {
        const balanceOfToken = tokenBalancesPerChain.get(chainId);
        if (balanceOfToken === undefined) {
          return [chainId, true];
        }
        return [chainId, balanceOfToken > totalDonationsPerChain[chainId]];
      })
    );
  }, [chainIds, tokenBalancesPerChain, totalDonationsPerChain]);

  const { data: rounds } = useSWR(projects, (projects) => {
    const uniqueProjects = uniqBy(projects, "roundId");
    return Promise.all(
      uniqueProjects.map(async (proj) => {
        const { round } = await dataLayer.getLegacyRoundById({
          roundId: proj.roundId,
          chainId: proj.chainId,
        });
        return round;
      })
    );
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
      removeProjectFromCart(project.grantApplicationId);
    });
  }, [projects, removeProjectFromCart, rounds]);

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
    setChainIdsBeingCheckedOut(
      chainIdsFromProjects.filter(
        (chainId) => enoughFundsToDonatePerChain[chainId]
      )
    );
  }, [enoughFundsToDonatePerChain, projectsByChain]);

  /** We find the round that ends last, and take its end date as the permit deadline */
  const currentPermitDeadline =
    rounds && rounds.length > 0
      ? [...rounds]
          .sort(
            (a, b) => a.roundEndTime.getTime() - b.roundEndTime.getTime()
          )[0]
          .roundEndTime.getTime()
      : 0;

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

  const [tokenBalances, setTokenBalances] = useState(new Map());
  useEffect(() => {
    const newTokenBalances = new Map(tokenBalances);
    Object.keys(projectsByChain)
      .map(parseChainId)
      .forEach(async (chainId) => {
        const votingToken = getVotingTokenForChain(chainId);
        const balance = await fetchBalance({
          token:
            votingToken.address === zeroAddress
              ? undefined
              : votingToken.address,
          chainId,
          address: address ?? zeroAddress,
        });
        newTokenBalances.set(chainId, balance.value);
      });
    setTokenBalances(newTokenBalances);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsByChain, address, getVotingTokenForChain]);

  function checkEmptyDonations() {
    const emptyDonationsExist =
      projects.filter(
        (project) => !project.amount || Number(project.amount) === 0
      ).length > 0;

    setEmptyInput(emptyDonationsExist);
    return emptyDonationsExist;
  }

  function handleConfirmation() {
    const emptyDonations = checkEmptyDonations();
    setClickedSubmit(true);

    if (emptyDonations) {
      return;
    }

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
        />
      </>
    );
  }

  async function handleSubmitDonation() {
    try {
      if (!walletClient || !allo) {
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
        allo
      );
    } catch (error) {
      console.error(error);
    }
  }

  const { passportColor, passportScore, passportState } = usePassport({
    address: address ?? "",
  });
  const passportTextClass = getClassForPassportColor(passportColor ?? "gray");

  const { data: totalDonationAcrossChainsInUSDData } = useSWR(
    totalDonationsPerChain,
    (totalDonationsPerChain) => {
      return Promise.all(
        Object.keys(totalDonationsPerChain).map((chainId) =>
          getTokenPrice(
            getVotingTokenForChain(parseChainId(chainId)).redstoneTokenId
          ).then((price) => {
            return (
              Number(
                formatUnits(
                  totalDonationsPerChain[chainId],
                  getVotingTokenForChain(parseChainId(chainId)).decimal
                )
              ) * Number(price)
            );
          })
        )
      );
    }
  );

  const totalDonationAcrossChainsInUSD =
    totalDonationAcrossChainsInUSDData?.reduce((acc, curr) => acc + curr, 0);

  /* Matching estimates are calculated per-round */
  const matchingEstimateParamsPerRound =
    rounds?.map((round) => {
      const projectFromRound = projects.find(
        (project) => project.roundId === round.id
      );
      return {
        roundId: getAddress(round.id ?? zeroAddress),
        chainId: projectFromRound?.chainId ?? ChainId.MAINNET,
        potentialVotes: projects
          .filter((proj) => proj.roundId === round.id)
          .map((proj) => ({
            amount: parseUnits(
              proj.amount ?? "0",
              getVotingTokenForChain(parseChainId(proj.chainId)).decimal ?? 18
            ),
            grantAddress: proj.recipient,
            voter: address ?? zeroAddress,
            token: getVotingTokenForChain(
              parseChainId(proj.chainId)
            ).address.toLowerCase(),
            projectId: proj.projectRegistryId,
            applicationId: proj.grantApplicationId,
            roundId: getAddress(round.id ?? zeroAddress),
          })),
      };
    }) ?? [];

  const {
    data,
    error: matchingEstimateError,
    isLoading: matchingEstimateLoading,
  } = useMatchingEstimates(matchingEstimateParamsPerRound);

  const matchingEstimates = data?.length && data.length > 0 ? data : undefined;
  const estimateText = matchingEstimatesToText(matchingEstimates);

  /** Special case where none of the chains to be checked out have enough funds */
  const notEnoughFunds = Object.values(enoughFundsToDonatePerChain).every(
    (value) => !value
  );

  /** If there are no projects, render nothing */
  if (projects.length === 0) {
    return null;
  }

  const noPassportRoundsInCart =
    rounds?.filter(
      (round) => round.roundMetadata?.quadraticFundingConfig?.sybilDefense
    ).length === 0;

  return (
    <div className="mb-5 block px-[16px] py-4 rounded-lg shadow-lg bg-white border border-violet-400 font-semibold sticky top-20">
      <h2 className="text-xl border-b-2 pb-2">Summary</h2>
      <div
        className={`flex flex-row items-center justify-between mt-4 font-semibold italic ${passportTextClass}`}
      >
        {matchingEstimateError === undefined &&
          matchingEstimates !== undefined && (
            <>
              <div className="flex flex-row mt-4 items-center">
                <p>Estimated match</p>
                <MatchingEstimateTooltip
                  isEligible={
                    (passportScore !== undefined && passportScore >= 15) ||
                    noPassportRoundsInCart
                  }
                />
              </div>
              <div className="flex justify-end mt-4">
                <Skeleton isLoaded={!matchingEstimateLoading}>
                  <p>
                    <BoltIcon className={"w-4 h-4 inline"} />
                    ~$
                    {estimateText}
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
            selectedPayoutToken={getVotingTokenForChain(parseChainId(chainId))}
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
          disabled={notEnoughFunds}
          onClick={() => {
            /* If wallet is not connected, display Rainbowkit modal */
            if (!isConnected) {
              openConnectModal?.();
              return;
            }

            /* Check if user hasn't connected passport yet, display the warning modal */
            if (
              (passportState === PassportState.ERROR ||
                passportState === PassportState.NOT_CONNECTED ||
                passportState === PassportState.INVALID_PASSPORT) &&
              !noPassportRoundsInCart
            ) {
              setDonateWarningModalOpen(true);
              return;
            }

            /* If passport is fine, proceed straight to confirmation */
            handleConfirmation();
          }}
          className="items-center shadow-sm text-sm rounded w-full mt-4"
        >
          {isConnected
            ? notEnoughFunds
              ? "Not enough funds to donate"
              : "Submit your donation!"
            : "Connect wallet to continue"}
        </Button>
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
      <PayoutModals />
    </div>
  );
}
