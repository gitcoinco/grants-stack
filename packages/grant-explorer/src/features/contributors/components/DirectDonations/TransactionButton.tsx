import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { Button } from "common/src/styles";
import { getTxBlockExplorerLink } from "common";

export function TransactionButton(props: { chainId: number; txHash: string }) {
  return (
    <a
      target={"_blank"}
      href={getTxBlockExplorerLink(props.chainId, props.txHash)}
    >
      <Button
        type="button"
        $variant="external-link"
        className="text-sm flex flex-row items-center border border-grey-100 rounded-lg text-black font-mono p-2"
      >
        <ArrowTopRightOnSquareIcon className="h-3 inline mx-2" />
        {props.txHash.slice(0, 5) + "..." + props.txHash.slice(-5)}
      </Button>
    </a>
  );
}
