import { ExclamationCircleIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { useBalance } from "wagmi";
import { Round } from "../api/types";
import { payoutTokens, useTokenPrice } from "../api/utils";
import { Spinner } from "../common/Spinner";

export default function ReclaimFunds(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  const currentTime = new Date();
  const isBeforeRoundEndDate =
    props.round && props.round.roundEndTime >= currentTime;
  const isAfterRoundEndDate =
    props.round && props.round.roundEndTime <= currentTime;

  return (
    <div>
      {isBeforeRoundEndDate && <NoInformationContent />}
      {isAfterRoundEndDate && (
        <InformationContent
          round={props.round}
          chainId={props.chainId}
          roundId={props.roundId}
        />
      )}
    </div>
  );
}

function NoInformationContent() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <ExclamationCircleIcon className="w-6 h-6" />
      </div>
      <NoInformationMessage />
    </div>
  );
}

function NoInformationMessage() {
  return (
    <>
      <h2 className="mt-8 text-2xl antialiased">
        X days until you can reclaim funds
      </h2>
      <div className="text-sm">
        If there is a balance left over, you will be able to reclaim funds here.
      </div>
    </>
  );
}

function ReclaimFundsContent(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  const [walletAddress, setWalletAddress] = useState<string>("");

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

  const matchingFunds =
    props.round &&
    props.round.roundMetadata.matchingFunds?.matchingFundsAvailable;
  const { data, error, loading } = useTokenPrice(
    matchingFundPayoutToken?.coingeckoId
  );
  const matchingFundsInUSD =
    matchingFunds && data && !loading && !error && matchingFunds * Number(data);

  const tokenBalanceInUSD =
    balanceData?.value &&
    data &&
    !loading &&
    !error &&
    !isBalanceError &&
    !isBalanceLoading &&
    Number(balanceData?.formatted) * Number(data);
  return (
    <div className="mt-8">
      <p
        className="font-bold mb-10 text-base"
        data-testid="fund-contract-title"
      >
        Reclaim Funds
      </p>
      <p className="font-bold text-sm">Contract Balance</p>
      <hr className="mt-2 mb-4" />
      <p className="text-sm text-grey-400 mb-4">
        Reclaim funds that were leftover from the round back to your wallet.
      </p>
      <div className="flex flex-col mt-4 max-w-xl">
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
            {matchingFunds?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{" "}
            {matchingFundPayoutToken?.name}{" "}
            <span className="text-sm text-slate-400 ml-2">
              $
              {matchingFundsInUSD?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              USD
            </span>
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Amount in contract:</p>
          <p className="text-sm">
            {Number(balanceData?.formatted).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{" "}
            {matchingFundPayoutToken?.name}{" "}
            <span className="text-sm text-slate-400 ml-2">
              $
              {tokenBalanceInUSD?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              USD
            </span>
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3 py-3">Wallet address:</p>
          <input
            className="border border-gray-300 rounded-md p-2 w-1/2"
            placeholder="Enter a valid wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>
        <div className="flex flex-row justify-start mt-6">
          <button
            className="bg-violet-400 hover:bg-violet-700 text-white py-2 px-4 rounded disabled:opacity-50"
            data-testid="fund-contract-btn"
            disabled={walletAddress.length == 0 || balanceData?.value.isZero()}
          >
            Reclaim funds
          </button>
        </div>
      </div>
    </div>
  );
}

function InformationContent(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  const loading = false;
  const error = false;
  return (
    <>
      <div>
        {loading && <Spinner text="We're fetching the round data." />}
        {error && <ErrorMessage />}
      </div>
      {!error && !loading && <ReclaimFundsContent {...props} />}
    </>
  );
}

function ErrorMessage() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <ExclamationCircleIcon className="w-6 h-6" />
      </div>
      <h2 className="mt-8 text-2xl antialiased" data-testid="error-info">
        Error
      </h2>
      <div className="mt-2 text-sm">There was an error fetching the data.</div>
    </div>
  );
}
