import React from "react";
import { CartProject, PayoutToken } from "../../api/types";
import { useRoundById } from "../../../context/RoundContext";
import { ProjectInCart } from "./ProjectInCart";

export function RoundInCart(
  props: React.ComponentProps<"div"> & {
    roundCart: CartProject[];
    selectedPayoutToken: PayoutToken;
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
  return (
    <div className="my-4 bg-grey-50 rounded-xl">
      <div className="flex flex-row pt-4 sm:px-4 px-2">
        <p className="text-xl  font-semibold">{round?.roundMetadata?.name}</p>
        <p className="text-lg font-bold ml-2">({props.roundCart.length})</p>
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
            roundRoutePath={`/round/${props.roundCart[0].chainId}/${props.roundCart[0].roundId}`}
            last={key === props.roundCart.length - 1}
            payoutTokenPrice={props.payoutTokenPrice}
          />
        </div>
      ))}
    </div>
  );
}
