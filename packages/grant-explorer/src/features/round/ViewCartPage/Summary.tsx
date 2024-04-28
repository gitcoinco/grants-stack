import { ChainId, useTokenPrice, VotingToken } from "common";
import { CHAINS } from "../../api/utils";
import { formatUnits, zeroAddress } from "viem";
import { useAccount, useBalance } from "wagmi";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

type SummaryProps = {
  totalDonation: bigint;
  selectedPayoutToken: VotingToken;
  chainId: ChainId;
};

export function Summary({
  selectedPayoutToken,
  totalDonation,
  chainId,
}: SummaryProps) {
  const { data: payoutTokenPrice } = useTokenPrice(
    selectedPayoutToken.redstoneTokenId
  );
  const totalDonationInUSD =
    payoutTokenPrice &&
    Number(formatUnits(totalDonation, selectedPayoutToken.decimal)) *
      Number(payoutTokenPrice);

  const { address } = useAccount();

  const { data: balance } = useBalance({
    address,
    token:
      selectedPayoutToken.address === zeroAddress
        ? undefined
        : selectedPayoutToken.address,
    chainId,
  });
  /*TODO: make this an explicit cehck of `balance !== undefined && totaldonation > balance.value ` */
  const insufficientFunds = balance ? totalDonation > balance.value : false;

  return (
    <div>
      <div className="flex flex-row justify-between mt-2 mb-5">
        <div className="flex flex-col">
          <p className="mb-2">Your contribution on</p>
          <p>
            <img
              className={"inline max-w-[32px] mr-2"}
              alt={CHAINS[chainId].name}
              src={CHAINS[chainId].logo}
            />
            {CHAINS[chainId].name}
          </p>
        </div>
        <div className="flex flex-col">
          <p className="text-right">
            <span data-testid={"totalDonation"} className="mr-2">
              {formatUnits(totalDonation, selectedPayoutToken.decimal)}
            </span>
            <span data-testid={"summaryPayoutToken"}>
              {selectedPayoutToken.name}
            </span>
          </p>
          {payoutTokenPrice && (
            <div className="flex justify-end mt-2">
              <p className="text-[14px] text-[#979998] font-bold">
                ${totalDonationInUSD?.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
      {insufficientFunds && (
        <p
          data-testid="insufficientBalance"
          className="rounded-md bg-red-50 font-medium p-2 text-pink-500 flex justify-start items-center mt-2 mb-6 text-sm"
        >
          <InformationCircleIcon className="w-4 h-4 mr-1" />
          <span>Insufficient funds to donate on this network</span>
        </p>
      )}
    </div>
  );
}
