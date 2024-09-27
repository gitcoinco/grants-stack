import {
  getVotingTokenOptions,
  GroupedCartProjectsByRoundId,
} from "../../api/utils";
import React, { useEffect, useState } from "react";
import { PayoutTokenDropdown } from "./PayoutTokenDropdown";
import { ApplyTooltip } from "./ApplyTooltip";
import { RoundInCart } from "./RoundInCart";
import { useTokenPrice, TToken, stringToBlobUrl, getChainById } from "common";
import { Button, Input } from "common/src/styles";
import { useCartStorage } from "../../../store";
import { ChainBalances } from "../../api/types";
import {
  ArrowRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { SwapParams } from "./SquidWidget";
import { useAccount } from "wagmi";

type Props = {
  cart: GroupedCartProjectsByRoundId;
  chainId: number;
  balances: ChainBalances;
  handleSwap: (params: SwapParams) => void;
};

export function CartWithProjects({
  cart,
  chainId,
  balances,
  handleSwap,
}: Props) {
  const { address, chainId: connectedChain } = useAccount();
  const chain = getChainById(chainId);
  const cartByRound = Object.values(cart);
  const totalDonationAmount = cartByRound.reduce(
    (acc, curr) =>
      acc + curr.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    0
  );
  const store = useCartStorage();
  const [fixedDonation, setFixedDonation] = useState("");

  const { getVotingTokenForChain, setVotingTokenForChain } = useCartStorage();
  const selectedPayoutToken = getVotingTokenForChain(chainId);
  const payoutTokenOptions: TToken[] = getVotingTokenOptions(
    Number(chainId)
  ).filter((p) => p.canVote);
  const payoutTokenBalance = balances
    ? balances[selectedPayoutToken.address.toLowerCase()].formattedAmount
    : 0;

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
            src={stringToBlobUrl(chain.icon)}
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
              className="w-16 lg:w-18 max-h-10"
            />
            <PayoutTokenDropdown
              selectedPayoutToken={selectedPayoutToken}
              setSelectedPayoutToken={(token) => {
                setVotingTokenForChain(chainId, token);
              }}
              payoutTokenOptions={payoutTokenOptions}
              balances={balances}
              balanceWarning={payoutTokenBalance < totalDonationAmount}
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
      {totalDonationAmount > 0 && totalDonationAmount > payoutTokenBalance && (
        <div className="flex flex-row justify-between my-4">
          <div className="rounded-md bg-red-50 py-2 text-pink-500 flex items-center text-sm p-5">
            <ExclamationCircleIcon className="w-8 h-8 mr-4 text-left" />
            <span className="p-2 pr-4">
              You do not have enough funds in your wallet to complete this
              donation. Please bridge funds to this network in order to submit
              your donation.
            </span>
            <div
              onClick={() =>
                handleSwap({
                  initialFromChainId:
                    !connectedChain || connectedChain === chainId
                      ? 1
                      : connectedChain,
                  initialToChainId: chainId,
                  fromTokenAddress:
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                  toTokenAddress: selectedPayoutToken.address,
                })
              }
              className="flex items-center text-sm decoration-1 w-full sm:w-40 justify-end cursor-pointer"
            >
              Bridge Funds
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </div>
          </div>
        </div>
      )}
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
