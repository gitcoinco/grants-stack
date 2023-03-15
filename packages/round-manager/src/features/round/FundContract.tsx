import { InformationCircleIcon } from "@heroicons/react/solid";
import ReactTooltip from "react-tooltip";
import { useBalance } from "wagmi";
import { Round } from "../api/types";
import {
  ChainId,
  getTxExplorerForContract,
  payoutTokens,
  useTokenPrice,
} from "../api/utils";
import { Spinner } from "../common/Spinner";

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

  const tokenDetail = {
    addressOrName: props.roundId,
    token: matchingFundPayoutToken?.address,
  };

  const {
    data: balanceData,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useBalance(tokenDetail);

  const { data, error, loading } = useTokenPrice(
    matchingFundPayoutToken?.coingeckoId
  );

  const matchingFunds =
    props.round &&
    props.round.roundMetadata.matchingFunds?.matchingFundsAvailable;

  const matchingFundsInUSD =
    matchingFunds && data && !loading && !error && matchingFunds * Number(data);

  const amountLeftToFund =
    matchingFunds && matchingFunds - Number(balanceData?.formatted);

  const amountLeftToFundInUSD =
    amountLeftToFund && amountLeftToFund * Number(data);

  const tokenBalanceInUSD =
    balanceData?.value &&
    data &&
    !loading &&
    !error &&
    !isBalanceError &&
    !isBalanceLoading &&
    Number(balanceData?.formatted) * Number(data);

  if (props.round === undefined || isBalanceLoading || loading) {
    return <Spinner text="Loading..." />;
  }

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
              <InformationIcon
                dataFor="contract-tooltip"
                dataTestId="contract-tooltip"
              />
              <ReactTooltip
                id="contract-tooltip"
                place="bottom"
                type="dark"
                effect="solid"
              >
                <p className="text-xs">
                  This is the contract address of your round's core
                  <br />
                  contract.
                </p>
              </ReactTooltip>
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
              <InformationIcon
                dataFor="protocol-fee-tooltip"
                dataTestId="protocol-fee-tooltip"
              />
              <ReactTooltip
                id="protocol-fee-tooltip"
                place="bottom"
                type="dark"
                effect="solid"
              >
                <p className="text-xs">
                  Allo Protocol can be configured to charge fees
                  <br />
                  for use. These fees are paid to GitcoinDAO, who
                  <br />
                  use the funds to fund public goods. If enabled,
                  <br />
                  the fee is calculated as a percentage of your
                  <br />
                  funding pool, added on top of your pool.
                </p>
              </ReactTooltip>
            </span>
          </p>
          <p className="text-sm">0%</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="flex flex-row text-sm w-1/3">
            Round fee:
            <span>
              <InformationIcon
                dataFor="round-fee-tooltip"
                dataTestId="round-fee-tooltip"
              />
              <ReactTooltip
                id="round-fee-tooltip"
                place="bottom"
                type="dark"
                effect="solid"
              >
                <p className="text-xs">
                  The round fees are any additional charges
                  <br />
                  for services used to run your round. These
                  <br />
                  can be software services (i.e. this user interface)
                  <br />
                  or other specialty tools. If enabled, they are
                  <br />
                  calculated as a percentage of your funding pool.
                </p>
              </ReactTooltip>
            </span>
          </p>
          <p className="text-sm">0%</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Amount in contract:</p>
          <p className="text-sm">
            {balanceData?.formatted} {matchingFundPayoutToken?.name}{" "}
            <span className="text-sm text-slate-400 ml-2">
              ${tokenBalanceInUSD} USD
            </span>
          </p>
        </div>
        <hr className="mt-6 mb-6" />
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Amount left to fund:</p>
          <p className="text-sm">
            {" "}
            {amountLeftToFund} {matchingFundPayoutToken?.name}{" "}
            <span className="text-sm text-slate-400 ml-2">
              ${amountLeftToFundInUSD} USD
            </span>
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3 py-3">Amount to fund:</p>
          <input
            className="border border-gray-300 rounded-md p-2 w-1/2"
            placeholder="Enter the amount you wish to fund"
          />
        </div>
        <div className="flex flex-row justify-start mt-6">
          <button
            className="bg-violet-400 hover:bg-violet-700 text-white py-2 px-4 rounded"
            data-testid="fund-contract-btn"
          >
            Fund Contract
          </button>
          <button
            className="bg-white hover:text-violet-700 hover:border-violet-700 text-gray py-2 px-4 rounded border border-gray ml-4"
            data-testid="view-contract-btn"
            onClick={() =>
              window.open(
                getTxExplorerForContract(
                  props.chainId as unknown as ChainId,
                  props.roundId as string
                ),
                "_blank"
              )
            }
          >
            View Contract
          </button>
        </div>
      </div>
    </div>
  );
}

function InformationIcon(props: { dataFor: string; dataTestId: string }) {
  return (
    <InformationCircleIcon
      className="mt-1 ml-1 text-gray-900 w-3 h-3"
      data-tip
      data-background-color="#0E0333"
      data-for={props.dataFor}
      data-testid={props.dataTestId}
    />
  );
}
