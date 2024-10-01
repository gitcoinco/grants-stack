import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

import { getTxBlockExplorerLink } from "common";

import { truncateAddress } from "../../utils/address";

export function TransactionHeader({
  transactionHash,
  transactionChainId,
}: {
  transactionHash: string;
  transactionChainId: number;
}) {
  const transactionLink = getTxBlockExplorerLink(
    transactionChainId,
    transactionHash
  );
  const parcialTransactionHash = truncateAddress(transactionHash, 5);

  return (
    <div className="bg-grey-75 rounded-lg px-3 py-4">
      <h1 className="font-medium font-mono text-xl">
        <a target={"_blank"} href={transactionLink}>
          {`Transaction #${parcialTransactionHash}`}
          <ArrowTopRightOnSquareIcon className="mb-1 h-5 inline ml-2" />
        </a>
      </h1>
    </div>
  );
}
