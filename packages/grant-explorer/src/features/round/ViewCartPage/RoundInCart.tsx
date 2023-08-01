import React from "react";
import {
  CartDonation,
  CartProject,
  PayoutToken,
  recipient,
} from "../../api/types";
import { useRoundById } from "../../../context/RoundContext";
import { ProjectInCart } from "./ProjectInCart";

export function RoundInCart(
  props: React.ComponentProps<"div"> & {
    roundcart: CartProject[];
    donations: CartDonation[];
    selectedPayoutToken: PayoutToken;
    handleRemoveProjectsFromCart: (projectsToRemove: CartProject[]) => void;
    payoutTokenPrice: number;
    updateDonations: (
      projectRegistryId: string,
      amount: string,
      projectAddress: recipient,
      applicationIndex: number,
      roundId: string
    ) => void;
  }
) {
  const round = useRoundById(
    String(props.roundcart[0].chainId),
    props.roundcart[0].roundId
  ).round;
  const minDonationThresholdAmount =
    round?.roundMetadata?.quadraticFundingConfig?.minDonationThresholdAmount;
  return (
    <div className="my-4 bg-grey-100 rounded-xl">
      <div className="flex flex-row pt-4 px-2">
        <p className="text-lg font-bold">{round?.roundMetadata?.name}</p>
        <p className="text-lg font-bold ml-2">({props.roundcart.length})</p>
      </div>
      <div>
        <p className="text-sm pt-2 pb-4 px-2">
          Your donation to each project must be valued at{" "}
          {minDonationThresholdAmount} USD or more to be eligible for matching.
        </p>
      </div>
      {props.roundcart.map((project: CartProject, key: number) => (
        <div key={key}>
          <ProjectInCart
            donations={props.donations}
            selectedPayoutToken={props.selectedPayoutToken}
            handleRemoveProjectsFromCart={props.handleRemoveProjectsFromCart}
            project={project}
            index={key}
            roundRoutePath={`/round/${props.roundcart[0].chainId}/${props.roundcart[0].roundId}`}
            last={key === props.roundcart.length - 1}
            payoutTokenPrice={props.payoutTokenPrice}
            updateDonations={props.updateDonations}
          />
        </div>
      ))}
    </div>
  );
}
