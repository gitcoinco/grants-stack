import { Spinner } from "../common/Spinner";
import React, { useEffect, useState } from "react";
import { XIcon } from "@heroicons/react/outline";
import { Round } from "../api/types";

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
      <p className="text-sm text-grey-400">
        You must fund the smart contract with the matching pool amount you
        pledged during round creation. However, you are always welcome to fund
        over the initial amount if you wish to do so.
      </p>
      <div className="mt-2">
        <p className="text-sm text-black-400 mt-6">Contract Address:</p>
        <p className="text-sm text-black-400 mt-6">Payout Token:</p>
        <p className="text-sm text-black-400 mt-6">Matching pool size:</p>
        <p className="text-sm text-black-400 mt-6">Protocol Fee:</p>
        <p className="text-sm text-black-400 mt-6">Round fee:</p>
        <p className="text-sm text-black-400 mt-6">Amount in contract:</p>
      </div>
    </div>
  );
}
