/* eslint-disable no-unexpected-multiline */
import { ChainId, getTokenPrice, NATIVE, submitPassportLite } from "common";
import { useCartStorage } from "../../../store";
import { useEffect, useMemo, useState } from "react";
import { Summary } from "./Summary";
import ChainConfirmationModal from "../../common/ConfirmationModal";
import { ChainConfirmationModalBody } from "./ChainConfirmationModalBody";
import { ProgressStatus } from "../../api/types";
import { modalDelayMs } from "../../../constants";
import { useNavigate } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "common/src/styles";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { BoltIcon } from "@heroicons/react/24/outline";
import { getClassForPassportColor } from "../../api/passport";
import useSWR from "swr";
import { groupBy, uniqBy } from "lodash-es";
import MRCProgressModal from "../../common/MRCProgressModal";
import { MRCProgressModalBody } from "./MRCProgressModalBody";
import { useCheckoutStore } from "../../../checkoutStore";
import { Address, formatUnits, parseUnits, zeroAddress } from "viem";
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
import { getFormattedRoundId } from "../../common/utils/utils";
import { datadogLogs } from "@datadog/browser-logs";

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
              votingToken.address === zeroAddress ||
              votingToken.address === NATIVE
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
          .sort((a, b) => a.roundEndTime.getTime() - b.roundEndTime.getTime())
          [rounds.length - 1].roundEndTime.getTime()
      : 0;

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

  const [tokenBalances, setTokenBalances] = useState(new Map());
  useEffect(() => {
    const newTokenBalances = new Map(tokenBalances);
    Object.keys(projectsByChain)
      .map(parseChainId)
      .forEach(async (chainId) => {
        const votingToken = getVotingTokenForChain(chainId);
        const balance = await fetchBalance({
          token:
            votingToken.address === zeroAddress ||
            votingToken.address === NATIVE
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
        allo,
        dataLayer
      );
    } catch (error) {
      console.error(error);
    }
  }

  const passportTextClass = getClassForPassportColor("black");

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
        chainId: projectFromRound?.chainId ?? round.chainId ?? ChainId.MAINNET,
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
              selectedPayoutToken={getVotingTokenForChain(
                parseChainId(chainId)
              )}
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
        disabled={notEnoughFunds}
        onClick={() => {
          /* If wallet is not connected, display Rainbowkit modal */
          if (!isConnected) {
            openConnectModal?.();
            return;
          }

          /* Check if user hasn't connected passport yet, display the warning modal */
          // if (estimate === 0 && !noPassportRoundsInCart) {
          //   setDonateWarningModalOpen(true);
          //   return;
          // }

          handleConfirmation();
        }}
        className={`${
          notEnoughFunds && "border-t"
        } items-center text-sm rounded-b-3xl w-full bg-blue-100 text-black py-5 text-normal font-mono`}
      >
        {isConnected
          ? notEnoughFunds
            ? "Not enough funds to donate"
            : "Submit your donation!"
          : "Connect wallet to continue"}
      </Button>
      <PayoutModals />
    </div>
  );
}
