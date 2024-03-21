import { datadogLogs } from "@datadog/browser-logs";
import { ExclamationCircleIcon } from "@heroicons/react/outline";
import { ethers } from "ethers";
import { Logger } from "ethers/lib.esm/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBalance } from "wagmi";
import { errorModalDelayMs } from "../../constants";
import { useReclaimFunds } from "../../context/round/ReclaimFundsContext";
import { ProgressStatus, Round } from "../api/types";
import ConfirmationModal from "../common/ConfirmationModal";
import ErrorModal from "../common/ErrorModal";
import ProgressModal from "../common/ProgressModal";
import { Spinner } from "../common/Spinner";
import { AdditionalGasFeesNote } from "./BulkApplicationCommon";
import { useTokenPrice } from "common";
import { assertAddress } from "common/src/address";
import { payoutTokens } from "../api/payoutTokens";
import { useAllo } from "common";

export default function ReclaimFunds(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  if (props.round === undefined) {
    return <></>;
  }

  const currentTime = new Date().getTime();
  const roundEndTime = props.round.roundEndTime.getTime();

  let claimTime = roundEndTime;
  if (props.round?.tags?.includes("allo-v2")) {
    claimTime = roundEndTime + 1000 * 60 * 60 * 24 * 30;
  }

  const isBeforeClaimTime = currentTime < claimTime;
  const timeDifference = claimTime - currentTime;
  const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return (
    <div>
      {isBeforeClaimTime && <NoInformationContent daysLeft={daysLeft} />}
      {!isBeforeClaimTime && (
        <InformationContent
          round={props.round}
          chainId={props.chainId}
          roundId={props.roundId}
        />
      )}
    </div>
  );
}

function NoInformationContent(props: { daysLeft: number }) {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <ExclamationCircleIcon className="w-6 h-6" />
      </div>
      <NoInformationMessage daysLeft={props.daysLeft} />
    </div>
  );
}

function NoInformationMessage(props: { daysLeft: number }) {
  return (
    <>
      <h2 className="mt-8 text-2xl antialiased">
        {props.daysLeft} days until you can reclaim funds
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
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalSubHeading, setErrorModalSubHeading] = useState<
    string | undefined
  >();
  const [transactionReplaced, setTransactionReplaced] = useState(false);

  const allo = useAllo();

  const { reclaimFunds, reclaimStatus } = useReclaimFunds();

  const payoutStrategy = props.round?.payoutStrategy.id ?? "";

  useEffect(() => {
    if (reclaimStatus === ProgressStatus.IS_ERROR) {
      setTimeout(() => {
        setOpenProgressModal(false);
        setErrorModalSubHeading(
          transactionReplaced
            ? "Transaction cancelled. Please try again."
            : "There was an error during the funding process. Please try again."
        );
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }

    if (reclaimStatus === ProgressStatus.IS_SUCCESS) {
      setTimeout(() => {
        setOpenProgressModal(false);
        // refresh
        navigate(0);
      }, errorModalDelayMs);
    }
  }, [navigate, transactionReplaced, props.roundId, reclaimStatus]);

  const matchingFundPayoutToken =
    props.round &&
    payoutTokens.filter(
      (t) =>
        t.address.toLowerCase() === props.round?.token?.toLowerCase() &&
        t.chainId === props.round.chainId
    )[0];

  const tokenDetail =
    matchingFundPayoutToken?.address == ethers.constants.AddressZero
      ? { address: assertAddress(payoutStrategy) }
      : {
          address: assertAddress(payoutStrategy),
          token: assertAddress(matchingFundPayoutToken?.address),
        };

  const {
    data: balanceData,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useBalance(tokenDetail);

  async function handleSubmitFund() {
    if (allo === null) {
      return;
    }

    if (matchingFundPayoutToken === undefined) {
      throw new Error("Matching fund payout token is undefined.");
    }

    try {
      await reclaimFunds({
        allo,
        payoutStrategy,
        token: matchingFundPayoutToken.address,
        recipient: walletAddress,
      });
    } catch (error) {
      if (error === Logger.errors.TRANSACTION_REPLACED) {
        setTransactionReplaced(true);
      } else {
        datadogLogs.logger.error(
          `error: handleSubmitFund - ${error}, id: ${props.roundId}`
        );
        console.error("handleSubmitFund - roundId", props.roundId, error);
      }
    }
  }

  const matchingFunds =
    props.round &&
    props.round.roundMetadata.quadraticFundingConfig?.matchingFundsAvailable;
  const { data, error, loading } = useTokenPrice(
    matchingFundPayoutToken?.redstoneTokenId
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

  function ConfirmationModalBody() {
    return (
      <div>
        <div className="flex flex-col text-center sm:ml-16">
          <div className="text-sm text-grey-400 mt-4 mb-1">
            FUNDS TO BE RECLAIMED
          </div>
          <div className="font-bold mb-1">
            {balanceData?.formatted} {matchingFundPayoutToken?.name}
          </div>
          <div className="text-md text-slate-400 mb-6">
            (${Number(tokenBalanceInUSD).toFixed(2)} USD)
          </div>
        </div>
        <AdditionalGasFeesNote />
      </div>
    );
  }

  const progressSteps = [
    {
      name: "Submit",
      description: "Reclaiming funds from the round.",
      status: reclaimStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        reclaimStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  function ReclaimFundsModal() {
    return (
      <>
        <ConfirmationModal
          title={"Confirm Decision"}
          confirmButtonText={"Confirm"}
          confirmButtonAction={() => {
            setOpenProgressModal(true);
            setOpenConfirmationModal(false);
            handleSubmitFund();
          }}
          body={<ConfirmationModalBody />}
          isOpen={openConfirmationModal}
          setIsOpen={setOpenConfirmationModal}
        />
        <ProgressModal
          isOpen={openProgressModal}
          subheading={"Please hold while we reclaim your funds."}
          steps={progressSteps}
        />
        <ErrorModal
          isOpen={openErrorModal}
          setIsOpen={setOpenErrorModal}
          tryAgainFn={handleSubmitFund}
          subheading={errorModalSubHeading}
        />
      </>
    );
  }

  function handleReclaimFunds() {
    // check if signer has enough token balance
    setOpenConfirmationModal(true);
  }

  return (
    <div className="mt-8">
      <p
        className="font-bold mb-10 text-base"
        data-testid="reclaim-funds-title"
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
          <p className="text-sm w-1/2">Payout token:</p>
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
          <p className="text-sm w-1/2">Matching pool size:</p>
          <p className="text-sm">
            {matchingFunds?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{" "}
            {matchingFundPayoutToken?.name}{" "}
            {matchingFundsInUSD && matchingFundsInUSD > 0 ? (
              <span className="text-sm text-slate-400 ml-2">
                $
                {matchingFundsInUSD?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                USD
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/2">Amount in payout contract:</p>
          <p className="text-sm">
            {Number(balanceData?.formatted).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{" "}
            {matchingFundPayoutToken?.name}{" "}
            {tokenBalanceInUSD && tokenBalanceInUSD > 0 ? (
              <span className="text-sm text-slate-400 ml-2">
                $
                {tokenBalanceInUSD?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                USD
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/2 py-3">Wallet address:</p>
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
            data-testid="reclaim-fund-btn"
            disabled={walletAddress.length == 0 || balanceData?.value.isZero()}
            onClick={() => handleReclaimFunds()}
          >
            Reclaim funds
          </button>
        </div>
      </div>
      <ReclaimFundsModal />
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
