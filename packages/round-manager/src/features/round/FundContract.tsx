import { Spinner } from "../common/Spinner";
import React, { useEffect, useState } from "react";
import { XIcon } from "@heroicons/react/outline";
import { Round } from "../api/types";

export default function FundContract(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  return <div>Fund Contract</div>;
}
