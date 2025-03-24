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
import { TToken } from "common";
import { getFormattedRoundId } from "../../common/utils/utils";
import { PassportWidget } from "../../common/PassportWidget";

export function RoundInCart(
  props: React.ComponentProps<"div"> & {
    roundCart: CartProject[];
    selectedPayoutToken: TToken;
    handleRemoveProjectFromCart: (project: CartProject) => void;
    payoutTokenPrice: number;
  }
) {
  const round = useRoundById(
    props.roundCart[0].chainId,
    props.roundCart[0].roundId
  ).round;

  const isSybilDefenseEnabled =
    round?.roundMetadata?.quadraticFundingConfig?.sybilDefense === true ||
    round?.roundMetadata?.quadraticFundingConfig?.sybilDefense !== "none";

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
          typeof proj.amount === "string" && proj.amount !== "NaN"
            ? proj.amount
            : "0",
          votingTokenForChain.decimals ?? 18
        ),
        grantAddress: proj.recipient,
        voter: address ?? zeroAddress,
        token: votingTokenForChain.address.toLowerCase(),
        applicationId: proj.grantApplicationId,
      })),
    },
  ]);

  const estimate = matchingEstimatesToText(matchingEstimates);
  const [gitcoinEnabled, setGitcoinEnabled] = React.useState(false);
  const [gitcoinAmount, setGitcoinAmount] = React.useState("");
  const [gitcoinDonationType, setGitcoinDonationType] = React.useState<
    "percentage" | "amount"
  >("percentage");

  const baseDonationInUSD =
    props.roundCart.reduce((acc, proj) => acc + Number(proj.amount), 0) *
    props.payoutTokenPrice;

  // Helper function to convert between percentage and amount
  const convertAmount = (
    value: string,
    fromType: "percentage" | "amount",
    toType: "percentage" | "amount"
  ) => {
    const numValue = Number(value) || 0;
    if (fromType === toType) return value;
    if (fromType === "percentage" && toType === "amount") {
      return (
        (baseDonationInUSD * numValue) /
        (100 * props.payoutTokenPrice)
      ).toFixed(6);
    } else {
      return (
        (numValue * props.payoutTokenPrice * 100) /
        baseDonationInUSD
      ).toFixed(2);
    }
  };

  // Update the donation calculation
  const gitcoinDonationInUSD = gitcoinEnabled
    ? gitcoinDonationType === "percentage"
      ? (baseDonationInUSD * (Number(gitcoinAmount) || 0)) / 100
      : (Number(gitcoinAmount) || 0) * props.payoutTokenPrice
    : 0;

  const showMatchingEstimate =
    matchingEstimateError === undefined &&
    matchingEstimates !== undefined &&
    round?.chainId !== 43114; // Avalanche

  React.useEffect(() => {
    if (!gitcoinEnabled) {
      setGitcoinAmount("");
    }
  }, [gitcoinEnabled]);

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
            {minDonationThresholdAmount > 0 && (
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

          {/* Gitcoin Donation Section */}
          <div className="mt-4 p-4 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-2">
              <input
                type="checkbox"
                id="gitcoinDonation"
                className="rounded border-gray-300"
                checked={gitcoinEnabled}
                onChange={(e) => setGitcoinEnabled(e.target.checked)}
              />
              <label htmlFor="gitcoinDonation" className="text-sm font-medium">
                Support Gitcoin with an additional donation
              </label>
            </div>

            {gitcoinEnabled && (
              <div className="mt-2 flex items-center justify-end space-x-2">
                <input
                  type="number"
                  min="0"
                  max={gitcoinDonationType === "percentage" ? 1000 : undefined}
                  value={gitcoinAmount}
                  onChange={(e) => {
                    setGitcoinAmount(e.target.value);
                  }}
                  className="w-20 px-2 py-1 border rounded text-right"
                  placeholder="0"
                  step="any"
                />
                <select
                  value={gitcoinDonationType}
                  onChange={(e) => {
                    const newType = e.target.value as "percentage" | "amount";
                    const newAmount = convertAmount(
                      gitcoinAmount,
                      gitcoinDonationType,
                      newType
                    );
                    setGitcoinDonationType(newType);
                    setGitcoinAmount(newAmount);
                  }}
                  className="px-2 py-1 border rounded text-sm w-40"
                >
                  <option value="percentage">% of donation</option>
                  <option value="amount">
                    {props.selectedPayoutToken.code}
                  </option>
                </select>
                <span className="text-sm text-gray-500">
                  (${gitcoinDonationInUSD.toFixed(2)})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Total Donations */}
      <div className="p-4 bg-grey-100 rounded-b-xl font-medium text-lg">
        <div className="flex flex-row justify-between items-center">
          <div>
            {address && round && isSybilDefenseEnabled && (
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
                {isNaN(baseDonationInUSD)
                  ? "0.0"
                  : baseDonationInUSD.toFixed(2)}
                {gitcoinEnabled && gitcoinAmount !== "" && (
                  <span className="text-sm text-gray-500 ml-2">
                    (plus an additional ${gitcoinDonationInUSD.toFixed(2)}{" "}
                    Gitcoin donation)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
