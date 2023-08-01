import {
  CHAINS,
  getPayoutTokenOptions,
  GroupedCartProjectsByRoundId,
} from "../../api/utils";
import React, { useState } from "react";
import { CartProject, PayoutToken } from "../../api/types";
import { ethers } from "ethers";
import { PayoutTokenDropdown } from "./PayoutTokenDropdown";
import { ApplyTooltip } from "./ApplyTooltip";
import { RoundInCart } from "./RoundInCart";
import { ChainId, useTokenPrice } from "common";
import { useAccount, useBalance } from "wagmi";
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
  /*---------------------------------------------------------------*/
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const payoutTokenOptions: PayoutToken[] = getPayoutTokenOptions(
    Number(chainId)
  );
  const [selectedPayoutToken, setSelectedPayoutToken] = useState<PayoutToken>(
    payoutTokenOptions[0]
  );

  const { address } = useAccount();
  const tokenDetail =
    selectedPayoutToken.address == ethers.constants.AddressZero
      ? { address: address }
      : { address: address, token: selectedPayoutToken.address };
  // @ts-expect-error Temp until viem
  const selectedPayoutTokenBalance = useBalance(tokenDetail);

  const [transactionReplaced, setTransactionReplaced] = useState(false);
  const { data, error, loading } = useTokenPrice(
    selectedPayoutToken.redstoneTokenId
  );
  const payoutTokenPrice = !loading && !error ? Number(data) : undefined;

  return (
    <div className="grow block px-[16px] py-4 rounded-lg shadow-lg bg-white border">
      <div className="flex flex-col md:flex-row justify-between border-b-2 pb-2 gap-3">
        <div className="flex flex-row basis-[28%] gap-2">
          <img
            className="mt-2 inline-block h-9 w-9"
            src={chain.logo}
            alt={"Chain Logo"}
          />
          <h2 className="mt-3 text-xl font-semibold">{chain.name}</h2>
          <h2 className="mt-3 text-xl font-semibold">({cartByRound.length})</h2>
        </div>
        <div className="flex justify-end flex-row gap-2 basis-[72%]">
          <div className="flex gap-4">
            <p className="mt-4 md:mt-3 text-xs md:text-sm amount-text">
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
              className="w-16 md:w-24"
            />
            <PayoutTokenDropdown
              selectedPayoutToken={selectedPayoutToken}
              setSelectedPayoutToken={setSelectedPayoutToken}
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
              className="float-right md:float-none text-xs px-1 py-2 text-purple-600 border-0"
            >
              Apply to all
            </Button>
            <ApplyTooltip />
          </div>
        </div>
      </div>
      {cartByRound.map((roundcart: CartProject[], key: number) => (
        <RoundInCart
          key={key}
          roundCart={roundcart}
          handleRemoveProjectFromCart={store.remove}
          selectedPayoutToken={selectedPayoutToken}
          payoutTokenPrice={payoutTokenPrice ?? 0}
        />
      ))}
    </div>
  );
}
