import React from "react";
import { CartProject, VotingToken } from "../../api/types";
import { useRoundById } from "../../../context/RoundContext";
import { ProjectInCart } from "./ProjectInCart";
import {
  matchingEstimatesToText,
  useMatchingEstimates,
} from "../../../hooks/matchingEstimate";
import { getAddress, parseUnits, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useCartStorage } from "../../../store";
import { Skeleton } from "@chakra-ui/react";
import { BoltIcon } from "@heroicons/react/24/outline";
import { PassportState, usePassport } from "../../api/passport";
import { MatchingEstimateTooltip } from "../../common/MatchingEstimateTooltip";

export function RoundInCart(
  props: React.ComponentProps<"div"> & {
    roundCart: CartProject[];
    selectedPayoutToken: VotingToken;
    handleRemoveProjectFromCart: (projectsToRemove: string) => void;
    payoutTokenPrice: number;
  }
) {
  const round = useRoundById(
    String(props.roundCart[0].chainId),
    props.roundCart[0].roundId
  ).round;

  const minDonationThresholdAmount =
    round?.roundMetadata?.quadraticFundingConfig?.minDonationThresholdAmount ??
    1;

  const { address } = useAccount();
  const votingTokenForChain = useCartStorage((state) =>
    state.getVotingTokenForChain(props.roundCart[0]?.chainId)
  );

  const {
    data: matchingEstimates,
    error: matchingEstimateError,
    isLoading: matchingEstimateLoading,
  } = useMatchingEstimates([
    {
      roundId: getAddress(round?.id ?? zeroAddress),
      chainId: props.roundCart[0].chainId,
      potentialVotes: props.roundCart.map((proj) => ({
        roundId: getAddress(round?.id ?? zeroAddress),
        projectId: proj.projectRegistryId,
        amount: parseUnits(
          proj.amount ?? "0",
          votingTokenForChain.decimal ?? 18
        ),
        grantAddress: proj.recipient,
        voter: address ?? zeroAddress,
        token: votingTokenForChain.address.toLowerCase(),
        applicationId: proj.grantApplicationId,
      })),
    },
  ]);

  const estimateText = matchingEstimatesToText(matchingEstimates);

  const { passportState, passport } = usePassport({
    address: address ?? "",
  });

  const isNotEligibleForMatching =
    passportState === PassportState.NOT_CONNECTED ||
    (passport?.score !== undefined && Number(passport.score) < 1);

  return (
    <div className="my-4 bg-grey-50 rounded-xl">
      <div className="flex flex-row items-center pt-4 sm:px-4 px-2 justify-between">
        <div className={"flex"}>
          <p className="text-xl  font-semibold">{round?.roundMetadata?.name}</p>
          <p className="text-lg font-bold ml-2">({props.roundCart.length})</p>
        </div>
        <div
          className={`flex flex-row gap-4 items-center justify-between font-semibold italic ${
            isNotEligibleForMatching ? "text-red-400" : "text-teal-500"
          }`}
        >
          {matchingEstimateError === undefined &&
            matchingEstimates !== undefined && (
              <>
                <div className="flex flex-row  items-center">
                  <p>Estimated match</p>
                  <MatchingEstimateTooltip
                    isEligible={!isNotEligibleForMatching}
                  />
                </div>
                <div className="flex justify-end ">
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
      </div>
      {minDonationThresholdAmount && (
        <div>
          <p className="text-sm pt-2 pb-4 sm:px-4 px-2">
            Your donation to each project must be valued at{" "}
            {minDonationThresholdAmount} USD or more to be eligible for
            matching.
          </p>
        </div>
      )}
      {props.roundCart.map((project, key) => {
        const matchingEstimateUSD = matchingEstimates
          ?.flat()
          .find(
            (est) =>
              getAddress(est.recipient ?? zeroAddress) ===
              getAddress(project.recipient ?? zeroAddress)
          )?.differenceInUSD;
        return (
          <div key={key}>
            <ProjectInCart
              projects={props.roundCart}
              selectedPayoutToken={props.selectedPayoutToken}
              removeProjectFromCart={props.handleRemoveProjectFromCart}
              project={project}
              index={key}
              matchingEstimateUSD={matchingEstimateUSD}
              roundRoutePath={`/round/${props.roundCart[0].chainId}/${props.roundCart[0].roundId}`}
              last={key === props.roundCart.length - 1}
              payoutTokenPrice={props.payoutTokenPrice}
            />
          </div>
        );
      })}
    </div>
  );
}
