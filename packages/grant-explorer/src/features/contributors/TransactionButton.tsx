import { Button } from "common/src/styles";
import { getTxExplorerTxLink } from "../api/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export function TransactionButton(props: { chainId: number; txHash: string }) {
  return (
    <Button
      type="button"
      $variant="external-link"
      onClick={() =>
        window.open(getTxExplorerTxLink(props.chainId, props.txHash), "_blank")
      }
      className="flex flex-row text-gitcoin-violet-500 px-0"
    >
      <ArrowTopRightOnSquareIcon className="h-5 inline mx-2" />
      <div>View transaction</div>
    </Button>
  );
}
