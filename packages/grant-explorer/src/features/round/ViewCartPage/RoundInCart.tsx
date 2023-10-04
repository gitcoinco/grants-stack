import React from "react";
import { CartProject, VotingToken } from "../../api/types";
import { useRoundById } from "../../../context/RoundContext";
import { ProjectInCart } from "./ProjectInCart";
import { useMatchingEstimates } from "../../../hooks/matchingEstimate";
import { getAddress, parseUnits, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useCartStorage } from "../../../store";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Skeleton } from "@chakra-ui/react";
import { BoltIcon } from "@heroicons/react/24/outline";

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
    state.getVotingTokenForChain(props.roundCart[0].chainId)
  );

  const {
    data: matchingEstimates,
    error: matchingEstimateError,
    isLoading: matchingEstimateLoading,
  } = useMatchingEstimates([
    {
      roundId: getAddress(round?.id ?? zeroAddress),
      chainid: props.roundCart[0].chainId,
      potentialVotes: props.roundCart.map((proj) => ({
        amount: parseUnits(
          proj.amount ?? "0",
          votingTokenForChain.decimal ?? 18
        ),
        recipient: proj.recipient,
        contributor: address ?? zeroAddress,
        token: votingTokenForChain.address.toLowerCase(),
      })),
    },
  ]);

  const estimateText = matchingEstimates
    ?.flat()
    .map((est) => est.differenceInUSD ?? 0)
    .filter((diff) => diff > 0)
    .reduce((acc, b) => acc + b, 0)
    .toFixed(2);

  return (
    <div className="my-4 bg-grey-50 rounded-xl">
      <div className="flex flex-row pt-4 sm:px-4 px-2 justify-between">
        <div className={"flex"}>
          <p className="text-xl  font-semibold">{round?.roundMetadata?.name}</p>
          <p className="text-lg font-bold ml-2">({props.roundCart.length})</p>
        </div>
        {matchingEstimateError === undefined &&
          matchingEstimates !== undefined && (
            <div className={"flex text-teal-500 font-semibold"}>
              <div className="flex flex-row">
                <p className="mb-2">
                  Estimated match{" "}
                  <InformationCircleIcon className={"w-5 h-5 inline"} />
                </p>
              </div>
              <div className="flex justify-end ml-5">
                <Skeleton minW={"50px"} isLoaded={!matchingEstimateLoading}>
                  <p>
                    <BoltIcon className={"w-4 h-4 inline"} />
                    ~$
                    {estimateText}
                  </p>
                </Skeleton>
              </div>
            </div>
          )}
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
      {props.roundCart.map((project, key) => (
        <div key={key}>
          <ProjectInCart
            projects={props.roundCart}
            selectedPayoutToken={props.selectedPayoutToken}
            removeProjectFromCart={props.handleRemoveProjectFromCart}
            project={project}
            index={key}
            matchingEstimateUSD={
              matchingEstimates
                ?.flat()
                .find(
                  (est) =>
                    getAddress(est.recipient ?? zeroAddress) ===
                    getAddress(project.recipient ?? zeroAddress)
                )?.differenceInUSD
            }
            roundRoutePath={`/round/${props.roundCart[0].chainId}/${props.roundCart[0].roundId}`}
            last={key === props.roundCart.length - 1}
            payoutTokenPrice={props.payoutTokenPrice}
          />
        </div>
      ))}
    </div>
  );
}
