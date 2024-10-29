import { useTokenPrice, TToken, stringToBlobUrl, getChainById } from "common";

type SummaryProps = {
  totalDonation: number;
  selectedPayoutToken: TToken;
  chainId: number;
  enoughBalance: boolean;
};

export function Summary({
  selectedPayoutToken,
  totalDonation,
  chainId,
  enoughBalance,
}: SummaryProps) {
  const { data: payoutTokenPrice } = useTokenPrice(
    selectedPayoutToken.redstoneTokenId
  );
  const totalDonationInUSD =
    payoutTokenPrice && totalDonation * Number(payoutTokenPrice);

  const chain = getChainById(chainId);

  return (
    <div>
      <div
        className={`flex flex-row justify-between mt-2 ${enoughBalance && "mb-5"}`}
      >
        <div className="flex flex-col">
          <p className="mb-2">Your contribution on</p>
          <p>
            <img
              className={"inline max-w-[32px] mr-2"}
              alt={chain.prettyName}
              src={stringToBlobUrl(chain.icon)}
            />
            {chain.prettyName}
          </p>
        </div>
        <div className="flex flex-col">
          <p className="text-right">
            <span data-testid={"totalDonation"} className="mr-2">
              {totalDonation}
            </span>
            <span data-testid={"summaryPayoutToken"}>
              {selectedPayoutToken.code}
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
      {!enoughBalance && (
        <p
          data-testid="insufficientBalance"
          className="rounded-md font-normal text-pink-500 flex justify-start items-center mt-2 mb-5 text-xs"
        >
          <span>
            {`Insufficient funds in your wallet.`} <br />
            {`Please bridge funds over to ${getChainById(chainId).prettyName}.`}
          </span>
        </p>
      )}
    </div>
  );
}
