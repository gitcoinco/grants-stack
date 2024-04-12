import { Button } from "common/src/styles";
import { getTxBlockExplorerLink } from "common";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export function TransactionButton(props: { chainId: number; txHash: string }) {
  return (
    <a
      target={"_blank"}
      href={getTxBlockExplorerLink(props.chainId, props.txHash)}
    >
      <Button
        type="button"
        $variant="external-link"
        className="flex flex-row items-center border border-grey-100 rounded-lg text-black font-mono p-2"
      >
        <ArrowTopRightOnSquareIcon className="h-5 inline mx-2" />
        <span>View</span>
      </Button>
    </a>
  );
}
