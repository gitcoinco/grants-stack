import { InformationCircleIcon } from "@heroicons/react/solid";
import { Round } from "../api/types";
import { payoutTokens, useTokenPrice } from "../api/utils";

export default function FundContract(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  const matchingFundPayoutToken =
    props.round &&
    payoutTokens.filter(
      (t) =>
        t.address.toLocaleLowerCase() == props.round?.token?.toLocaleLowerCase()
    )[0];

  const { data, error, loading } = useTokenPrice(
    matchingFundPayoutToken?.coingeckoId
  );
  const matchingFunds =
    props.round &&
    props.round.roundMetadata.matchingFunds?.matchingFundsAvailable;
  const matchingFundsInUSD =
    matchingFunds && data && !loading && !error && matchingFunds * Number(data);

  return (
    <div className="mt-8">
      <p
        className="font-bold mb-10 text-base"
        data-testid="fund-contract-title"
      >
        Fund Contract
      </p>
      <p className="font-bold text-sm">Contract Details</p>
      <hr className="mt-2 mb-4" />
      <p className="text-sm text-grey-400 mb-4">
        You must fund the smart contract with the matching pool amount you
        pledged during round creation. However, you are always welcome to fund
        over the initial amount if you wish to do so.
      </p>
      <div className="flex flex-col mt-4 max-w-xl">
        <div className="flex flex-row justify-start">
          <p className="flex flex-row text-sm w-1/3">
            Contract Address:
            <span>
              <InformationIcon />
            </span>
          </p>
          <p className="text-sm">{props.round?.id}</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Payout token:</p>
          <p className="flex flex-row text-sm">
            {matchingFundPayoutToken?.logo ? (
              <img
                src={matchingFundPayoutToken.logo}
                alt=""
                className="h-6 w-6 flex-shrink-0 rounded-full"
              />
            ) : null}
            <span className="ml-2 pt-0.5">{matchingFundPayoutToken?.name}</span>
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Matching pool size:</p>
          <p className="text-sm">
            {matchingFunds} {matchingFundPayoutToken?.name}{" "}
            <span className="text-sm text-slate-400 ml-2">
              ${matchingFundsInUSD} USD
            </span>
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="flex flex-row text-sm w-1/3">
            Protocol fee:
            <span>
              <InformationIcon />
            </span>
          </p>
          <p className="text-sm">0%</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="flex flex-row text-sm w-1/3">
            Round fee:
            <span>
              <InformationIcon />
            </span>
          </p>
          <p className="text-sm">0%</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Amount in contract:</p>
          <p className="text-sm">
            11000 {matchingFundPayoutToken?.name}{" "}
            <span className="text-sm text-slate-400 ml-2">$1234.00 USD</span>
          </p>
        </div>
        <hr className="mt-6 mb-6" />
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Amount left to fund:</p>
          <p className="text-sm">0 {matchingFundPayoutToken?.name}</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3 py-3">Amount to fund:</p>
          <input
            className="border border-gray-300 rounded-md p-2 w-1/2"
            placeholder="Enter the amount you wish to fund"
          />
        </div>
        <div className="flex flex-row justify-start mt-6">
          <button className="bg-violet-400 hover:bg-violet-700 text-white py-2 px-4 rounded">
            Fund Contract
          </button>
          <button className="bg-white hover:text-violet-700 hover:border-violet-700 text-gray py-2 px-4 rounded border border-gray ml-4">
            View Contract
          </button>
        </div>
      </div>
    </div>
  );
}

function InformationIcon() {
  return <InformationCircleIcon className="mt-1 ml-1 text-gray-900 w-4 h-4" />;
}
