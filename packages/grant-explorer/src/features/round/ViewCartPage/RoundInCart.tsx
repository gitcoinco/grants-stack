import React from "react";
import { CartProject } from "../../api/types";
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
import { ChainId, VotingToken, isRoundUsingPassportLite } from "common";
import { getFormattedRoundId } from "../../common/utils/utils";
import { PassportWidget } from "../../common/PassportWidget";

export function RoundInCart(
  props: React.ComponentProps<"div"> & {
    roundCart: CartProject[];
    selectedPayoutToken: VotingToken;
    handleRemoveProjectFromCart: (project: CartProject) => void;
    payoutTokenPrice: number;
  }
) {
  const round = useRoundById(
    props.roundCart[0].chainId,
    props.roundCart[0].roundId
  ).round;

  const isSybilDefenseEnabled =
    round?.roundMetadata?.quadraticFundingConfig?.sybilDefense === true;

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
      roundId: getFormattedRoundId(round?.id ?? zeroAddress),
      chainId: props.roundCart[0].chainId,
      potentialVotes: props.roundCart.map((proj) => ({
        roundId: getFormattedRoundId(round?.id ?? zeroAddress),
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

  const estimate = matchingEstimatesToText(matchingEstimates);

  const totalDonationInUSD =
    props.roundCart.reduce((acc, proj) => acc + Number(proj.amount), 0) *
    props.payoutTokenPrice;

  const showMatchingEstimate =
    matchingEstimateError === undefined &&
    matchingEstimates !== undefined &&
    round?.chainId !== ChainId.AVALANCHE;

  return (
    <div className="my-4">
      {/* Round In Cart */}
      <div className="bg-grey-50 px-4 py-6 rounded-t-xl">
        <div className="flex flex-row items-end justify-between">
          <div className={"flex flex-col"}>
            <div>
              <p className="text-xl font-semibold inline">
                {round?.roundMetadata?.name}
              </p>
              <p className="text-lg font-bold ml-2 inline">
                ({props.roundCart.length})
              </p>
            </div>
            {minDonationThresholdAmount && (
              <div>
                <p className="text-sm pt-2 italic mb-5">
                  Your donation to each project must be valued at{" "}
                  {minDonationThresholdAmount} USD or more to be eligible for
                  matching.
                </p>
              </div>
            )}
          </div>
        </div>
        <div>
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
                  showMatchingEstimate={showMatchingEstimate}
                  matchingEstimateUSD={matchingEstimateUSD}
                  roundRoutePath={`/round/${props.roundCart[0].chainId}/${props.roundCart[0].roundId}`}
                  last={key === props.roundCart.length - 1}
                  payoutTokenPrice={props.payoutTokenPrice}
                />
              </div>
            );
          })}
        </div>
      </div>
      {/* Total Donations */}
      <div className="p-4 bg-grey-100 rounded-b-xl font-medium text-lg">
        <div className="flex flex-row justify-between items-center">
          <div>
            {address &&
              round &&
              (isSybilDefenseEnabled || isRoundUsingPassportLite(round)) && (
                <div data-testid="passport-widget">
                  <PassportWidget round={round} alignment="left" />
                </div>
              )}
          </div>
          <div className="flex flex-row gap-3 justify-center pt-1 pr-2">
            <div>
              {showMatchingEstimate && (
                <div className="flex justify-end flex-nowrap">
                  <Skeleton isLoaded={!matchingEstimateLoading}>
                    <div className="flex flex-row font-semibold">
                      <div
                        className={
                          "flex flex-col md:flex-row items-center gap-2 text-base"
                        }
                      >
                        <span className="mr-2">Total match</span>
                        <div className="flex flex-row items-center justify-between font-semibold text-teal-500">
                          <BoltIcon className={"w-4 h-4 inline"} />
                          ~$
                          {estimate?.toFixed(2)}
                        </div>
                      </div>
                      <span className="pl-4">|</span>
                    </div>
                  </Skeleton>
                </div>
              )}
            </div>
            <div className="font-semibold">
              <p>
                <span className="mr-2">Total donation</span>$
                {isNaN(totalDonationInUSD)
                  ? "0.0"
                  : totalDonationInUSD.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
