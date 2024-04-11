import {
  CHAINS,
  getVotingTokenOptions,
  GroupedCartProjectsByRoundId,
} from "../../api/utils";
import React, { useEffect, useState } from "react";
import { PayoutTokenDropdown } from "./PayoutTokenDropdown";
import { ApplyTooltip } from "./ApplyTooltip";
import { RoundInCart } from "./RoundInCart";
import { ChainId, useTokenPrice, VotingToken } from "common";
import { Button, Input } from "common/src/styles";
import { useCartStorage } from "../../../store";

type Props = {
  cart: GroupedCartProjectsByRoundId;
  chainId: ChainId;
};

export function CartWithProjects({ cart, chainId }: Props) {
  const chain = CHAINS[chainId];
  const cartByRound = Object.values(cart);

  const store = useCartStorage();

  const [fixedDonation, setFixedDonation] = useState("");

  const { getVotingTokenForChain, setVotingTokenForChain } = useCartStorage();
  const selectedPayoutToken = getVotingTokenForChain(chainId);
  const payoutTokenOptions: VotingToken[] = getVotingTokenOptions(
    Number(chainId)
  ).filter((p) => p.canVote);

  const { data, error, loading } = useTokenPrice(
    selectedPayoutToken.redstoneTokenId
  );
  const payoutTokenPrice = !loading && !error ? Number(data) : null;

  // get number of projects in cartByRound
  const projectCount = cartByRound.reduce((acc, curr) => acc + curr.length, 0);

  /** The payout token data (like permit version etc.) might've changed since the user last visited the page
   * Refresh it to update, default to the first payout token if the previous token was deleted */
  useEffect(() => {
    setVotingTokenForChain(
      chainId,
      getVotingTokenOptions(chainId).find(
        (token) => token.address === selectedPayoutToken.address
      ) ?? getVotingTokenOptions(chainId)[0]
    );
    /* We only want this to happen on first render */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <div className="grow block px-[16px] lg:pl-0 py-4 bg-white">
      <div className="flex flex-col md:flex-row justify-between border-b-2 pb-2 gap-3 mb-6">
        <div className="flex flex-row basis-[28%] gap-2">
          <img
            className="mt-2 inline-block h-9 w-9"
            src={chain.logo}
            alt={"Chain Logo"}
          />
          <h2 className="mt-3 text-2xl font-semibold">{chain.name}</h2>
          <h2 className="mt-3 text-2xl font-semibold">({projectCount})</h2>
        </div>
        <div className="flex justify-center sm:justify-end flex-row gap-2 basis-[72%]">
          <div className="flex gap-4">
            <p className="mt-4 md:mt-3 text-xs md:text-sm amount-text font-medium">
              Amount
            </p>
            <Input
              aria-label={"Donation amount for all projects "}
              id={"input-donationamount"}
              min="0"
              type="number"
              value={fixedDonation ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFixedDonation(e.target.value);
              }}
              className="w-16 lg:w-18"
            />
            <PayoutTokenDropdown
              selectedPayoutToken={selectedPayoutToken}
              setSelectedPayoutToken={(token) => {
                setVotingTokenForChain(chainId, token);
              }}
              payoutTokenOptions={payoutTokenOptions}
            />
          </div>
          <div className="flex flex-row">
            <Button
              type="button"
              $variant="outline"
              onClick={() => {
                store.updateDonationsForChain(chainId, fixedDonation);
              }}
              className="float-right md:float-none text-sm px-1 py-2 text-blue-200 border-0"
            >
              Apply to all
            </Button>
            <ApplyTooltip />
          </div>
        </div>
      </div>
      {cartByRound.map((roundcart, key) => (
        <div key={key}>
          <RoundInCart
            key={key}
            roundCart={roundcart}
            handleRemoveProjectFromCart={store.remove}
            selectedPayoutToken={selectedPayoutToken}
            payoutTokenPrice={payoutTokenPrice ?? 0}
          />
        </div>
      ))}
    </div>
  );
}
