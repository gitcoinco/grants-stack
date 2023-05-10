import { datadogLogs } from "@datadog/browser-logs";
import { InformationCircleIcon } from "@heroicons/react/solid";
import { BigNumber, ethers } from "ethers";
import { Logger } from "ethers/lib.esm/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { errorModalDelayMs } from "../../constants";
import { useFundContract } from "../../context/round/FundContractContext";
import { ProgressStatus, Round } from "../api/types";
import {
  getTxExplorerForContract,
  payoutTokens,
} from "../api/utils";
import ConfirmationModal from "../common/ConfirmationModal";
import ErrorModal from "../common/ErrorModal";
import ProgressModal from "../common/ProgressModal";
import { Spinner } from "../common/Spinner";
import { classNames, useTokenPrice } from "common";

export default function FundContract(props: {
  round: Round | undefined;
  roundId: string | undefined;
}) {
  const { address } = useAccount();
  const navigate = useNavigate();

  const [amountToFund, setAmountToFund] = useState("");
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalSubHeading, setErrorModalSubHeading] = useState<
    string | undefined
  >();
  const [transactionReplaced, setTransactionReplaced] = useState(false);

  const { chain } = useNetwork() || {};
  const chainId = chain?.id ?? 5;

  const {
    fundContract,
    tokenApprovalStatus,
    fundStatus,
    indexingStatus,
    txHash,
  } = useFundContract();

  useEffect(() => {
    if (
      tokenApprovalStatus === ProgressStatus.IS_ERROR ||
      fundStatus === ProgressStatus.IS_ERROR
    ) {
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

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      setTimeout(() => {
        navigate(`/round/${props.roundId}`);
      }, 5000);
    }

    if (
      tokenApprovalStatus === ProgressStatus.IS_SUCCESS &&
      fundStatus === ProgressStatus.IS_SUCCESS &&
      txHash !== ""
    ) {
      setTimeout(() => {
        setOpenProgressModal(false);
        // refresh
        navigate(0);
      }, errorModalDelayMs);
    }
  }, [
    navigate,
    tokenApprovalStatus,
    fundStatus,
    indexingStatus,
    txHash,
    transactionReplaced,
    props.roundId,
  ]);

  const matchingFundPayoutToken =
    props.round &&
    payoutTokens.filter(
      (t) =>
        t.address.toLocaleLowerCase() == props.round?.token?.toLocaleLowerCase()
    )[0];

  // todo: replace 0x0000000000000000000000000000000000000000 with native token for respective chain
  const tokenDetail = {
    addressOrName: props.roundId,
    token:
      matchingFundPayoutToken?.address ===
      "0x0000000000000000000000000000000000000000"
        ? undefined
        : matchingFundPayoutToken?.address,
  };

  const tokenDetailUser =
    matchingFundPayoutToken?.address == ethers.constants.AddressZero
      ? { addressOrName: address }
      : { addressOrName: address, token: matchingFundPayoutToken?.address };

  const {
    data: balanceData,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useBalance(tokenDetail);

  const { data, error, loading } = useTokenPrice(
    matchingFundPayoutToken?.redstoneTokenId
  );

  const matchingFunds =
    (props.round &&
      props.round.roundMetadata.quadraticFundingConfig
        ?.matchingFundsAvailable) ??
    0;

  const matchingFundsInUSD =
    matchingFunds && data && !loading && !error && matchingFunds * Number(data);

  const amountLeftToFund =
    matchingFunds && matchingFunds - Number(balanceData?.formatted ?? 0);

  const amountLeftToFundInUSD =
    amountLeftToFund && amountLeftToFund * Number(data ?? 0);

  // NOTE: round and protocol fee percentages are stored as decimals
  const roundFeePercentage = (props.round?.roundFeePercentage ?? 0) * 100;
  const protocolFeePercentage = (props.round?.protocolFeePercentage ?? 0) * 100;
  const combinedFees =
    ((roundFeePercentage + protocolFeePercentage) * matchingFunds) / 100;
  const contractBalance = ethers.utils.formatEther(
    balanceData?.value.toString() ?? "0"
  );
  const totalAmountLeftToFund = (
    combinedFees +
    matchingFunds -
    Number(contractBalance)
  ).toString();
  const totalDue = matchingFunds + combinedFees;

  const fundContractDisabled = Number(contractBalance) >= Number(totalDue);

  const tokenBalanceInUSD =
    balanceData?.value &&
    data &&
    !loading &&
    !error &&
    !isBalanceError &&
    !isBalanceLoading &&
    Number(balanceData?.formatted) * Number(data);

  const {
    data: matchingFundPayoutTokenBalance,
    // isError,
    // isFetched,
  } = useBalance(tokenDetailUser);

  function handleFundContract() {
    // check if signer has enough token balance
    const accountBalance = matchingFundPayoutTokenBalance?.value;
    const tokenBalance = ethers.utils.parseUnits(
      amountToFund,
      matchingFundPayoutToken?.decimal
    );

    if (!accountBalance || BigNumber.from(tokenBalance).gt(accountBalance)) {
      setInsufficientBalance(true);
      return;
    } else {
      setInsufficientBalance(false);
    }

    setOpenConfirmationModal(true);
  }

  if (props.round === undefined || isBalanceLoading || loading) {
    return <Spinner text="Loading..." />;
  }

  const progressSteps = [
    {
      name: "Submit",
      description: "Finalize your funding",
      status: fundStatus,
    },
    {
      name: "Indexing",
      description: "The subgraph is indexing the data.",
      status: indexingStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        indexingStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

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
            {matchingFundsInUSD && matchingFundsInUSD > 0 ? (
              <span className="text-sm text-slate-400 ml-2">
                ${matchingFundsInUSD} USD
              </span>
            ) : null}
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
          <p className="text-sm">{protocolFeePercentage}%</p>
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
          <p className="text-sm">{props.round.roundFeePercentage ?? 0}%</p>
        </div>
        <hr className="mt-6 mb-6" />
        {!props.round.payoutStrategy.isReadyForPayout ? (
          <>
            <div className="flex flex-row justify-start mt-6">
              <p className="text-sm w-1/3">Amount in contract:</p>
              <p className="text-sm">
                {contractBalance} {matchingFundPayoutToken?.name}{" "}
                {tokenBalanceInUSD && Number(tokenBalanceInUSD) > 0 ? (
                  <span className="text-sm text-slate-400 ml-2">
                    ${tokenBalanceInUSD} USD
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex flex-row justify-start mt-6">
              <p className="text-sm w-1/3">Amount left to fund:</p>
              <p className="text-sm">
                {" "}
                {totalAmountLeftToFund} {matchingFundPayoutToken?.name}{" "}
                {amountLeftToFundInUSD > 0 ? (
                  <span className="text-sm text-slate-400 ml-2">
                    ${amountLeftToFundInUSD} USD
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex flex-row justify-start mt-6">
              <p className="text-sm w-1/3 py-3">Amount to fund:</p>
              {/* todo: update input with a max selector at right of input */}
              <input
                disabled={fundContractDisabled}
                className="border border-gray-300 rounded-md p-2 w-1/2"
                placeholder={`${
                  fundContractDisabled
                    ? "Contract is fully funded"
                    : "Enter the amount you wish to fund"
                }`}
                value={amountToFund}
                onChange={(e) => setAmountToFund(e.target.value)}
              />
            </div>
            <div className="flex flex-row justify-start mt-6">
              <button
                disabled={fundContractDisabled}
                className={classNames(
                  `bg-violet-400 hover:bg-violet-700 text-white py-2 px-4 rounded ${
                    fundContractDisabled
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`
                )}
                data-testid="fund-contract-btn"
                onClick={() => handleFundContract()}
              >
                Fund Contract
              </button>
              <button
                className="bg-white hover:text-violet-700 hover:border-violet-700 text-gray py-2 px-4 rounded border border-gray ml-4"
                data-testid="view-contract-btn"
                onClick={() =>
                  window.open(
                    getTxExplorerForContract(chainId, props.roundId as string),
                    "_blank"
                  )
                }
              >
                View Contract
              </button>
            </div>
            {insufficientBalance && (
              <p
                data-testid="insufficientBalance"
                className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
              >
                <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
                <span>
                  You do not have enough funds for funding the matching pool.
                </span>
              </p>
            )}
            <FundContractModals />
          </>
        ) : (
          <div>
            <p className="text-sm text-grey-400 mb-4">
              {" "}
              Round has been finalized and funds have been moved to the payout
              contract.
            </p>
            <button
              disabled={fundContractDisabled}
              className={classNames(
                `${
                  fundContractDisabled ? "bg-violet-400" : "bg-violet-200"
                } text-white py-2 px-4 rounded`
              )}
              data-testid="fund-contract-btn"
              onClick={() => handleFundContract()}
            >
              Fund Contract
            </button>
          </div>
        )}
      </div>
    </div>
  );

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

  function FundContractModals() {
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
          subheading={"Please hold while we add your funds to the round."}
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

  function ConfirmationModalBody() {
    const amountInUSD =
      Number(
        parseFloat(amountToFund).toFixed(matchingFundPayoutToken?.decimal)
      ) * Number(data);
    return (
      <div>
        <div className="flex flex-col text-center sm:ml-16">
          <div className="text-sm text-grey-400 mt-4 mb-1">
            AMOUNT TO BE FUNDED
          </div>
          <div className="font-bold mb-1">
            {amountToFund} {matchingFundPayoutToken?.name}
          </div>
          {amountInUSD > 0 ? (
            <div className="text-md text-slate-400 mb-6">
              (${amountInUSD.toFixed(2)} USD)
            </div>
          ) : null}
        </div>
        <AdditionalGasFeesNote />
      </div>
    );
  }

  function AdditionalGasFeesNote() {
    return (
      <p className="text-sm italic text-grey-400 mb-2">
        Changes could be subject to additional gas fees.
      </p>
    );
  }

  async function handleSubmitFund() {
    try {
      setTimeout(() => {
        setOpenProgressModal(true);
      }, errorModalDelayMs);

      await fundContract({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        roundId: props.roundId!,
        fundAmount: Number(
          parseFloat(amountToFund).toFixed(matchingFundPayoutToken?.decimal)
        ),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        payoutToken: matchingFundPayoutToken!,
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
}
