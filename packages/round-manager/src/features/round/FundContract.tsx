import { InformationCircleIcon } from "@heroicons/react/solid";
import { Round } from "../api/types";

export default function FundContract(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  function getTimeLeft(roundEndTime: Date | undefined): string {
    if (!roundEndTime) {
      return "";
    }
    const dateDiffInSecs = (roundEndTime.getTime() || 0) - Date.now();
    const daysLeft = Math.floor(dateDiffInSecs / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor(
      (dateDiffInSecs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutesLeft = Math.floor(
      (dateDiffInSecs % (1000 * 60 * 60)) / (1000 * 60)
    );
    const secondsLeft = Math.floor((dateDiffInSecs % (1000 * 60)) / 1000);
    return `${daysLeft}d ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
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
          <p className="text-sm w-1/3">
            Contract Address: <InformationIcon />
          </p>
          <p className="text-sm">{props.round?.id}</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Payout token:</p>
          <p className="text-sm">{props.round?.token}</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Matching pool size:</p>
          <p className="text-sm">
            {props.round?.roundMetadata?.matchingFunds?.matchingFundsAvailable}{" "}
            {props.round?.token}{" "}
            <span className="text-sm text-slate-400 ml-6">$1234.00 USD</span>
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">
            Protocol fee: <InformationIcon />
          </p>
          <p className="text-sm">10%</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">
            Round fee: <InformationIcon />
          </p>
          <p className="text-sm">10%</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Amount in contract:</p>
          <p className="text-sm">
            11000 {props.round?.token}{" "}
            <span className="text-sm text-slate-400 ml-6">$1234.00 USD</span>
          </p>
        </div>
        <hr className="mt-6 mb-6" />
        <div className="flex flex-row justify-start">
          <p className="text-sm w-1/3">
            Final day to fund: <InformationIcon />
          </p>
          <p className="text-sm">
            {props.round?.roundEndTime.toLocaleString()}{" "}
            <span className="text-sm text-red-500 ml-6">
              ({getTimeLeft(props.round?.roundEndTime)})
            </span>
          </p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Amount left to fund:</p>
          <p className="text-sm">0 {props.round?.token}</p>
        </div>
        <div className="flex flex-row justify-start mt-6">
          <p className="text-sm w-1/3">Amount to fund:</p>
          <input
            className="border border-gray-300 rounded-md p-2"
            placeholder="Enter the amount you wish to fund"
          />
        </div>
        <div className="flex flex-row justify-start mt-6">
          <button className="bg-violet-400 hover:bg-violet-700 text-white py-2 px-4 rounded">
            Fund Contract
          </button>
          <button className="bg-white hover:bg-blue-700 text-gray py-2 px-4 rounded border border-gray ml-4">
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
