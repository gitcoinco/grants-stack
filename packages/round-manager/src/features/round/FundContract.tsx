import { Spinner } from "../common/Spinner";
import React, { useEffect, useState } from "react";
import { XIcon } from "@heroicons/react/outline";
import { Round } from "../api/types";
import { InformationCircleIcon } from "@heroicons/react/solid";

export default function FundContract(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
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
      <table className="mb-12">
        <tr>
          <td className="flex flex-row">
            Contract Address:
            <span>
              <InformationIcon />
            </span>
          </td>
          <td>{props.round?.id}</td>
        </tr>
        <tr>
          <td>Payout token:</td>
          <td>{props.round?.token}</td>
        </tr>
        <tr>
          <td>Matching pool size:</td>
          <td>
            {props.round?.roundMetadata?.matchingFunds?.matchingFundsAvailable}
          </td>
        </tr>
        <tr>
          <td className="flex flex-row">
            Protocol fee:
            <InformationIcon />
          </td>
          <td>10%</td>
        </tr>
        <tr>
          <td className="flex flex-row">
            Round fee:
            <InformationIcon />
          </td>
          <td>10%</td>
        </tr>
        <tr>
          <td>Amount in contract:</td>
          <td>0</td>
        </tr>
        <hr />
        <tr>
          <td className="flex flex-row">
            Final day to fund:
            <InformationIcon />
          </td>
          <td>{props.round?.roundEndTime.toString()}</td>
        </tr>
        <tr>
          <td>Amount left to fund:</td>
          <td>10,000</td>
        </tr>
        <tr>
          <td>Amount to fund:</td>
          <td>10,000</td>
        </tr>
      </table>
    </div>
  );
}

function InformationIcon() {
  return <InformationCircleIcon className="mt-1 ml-1 text-gray-900 w-4 h-4" />;
}
