import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

import { getTxBlockExplorerLink } from "common";

import { truncateAddress } from "../../utils/address";
import { MintingActionButton } from "../Buttons";
import { Contribution, MintingAttestationIdsData } from "data-layer";

interface AttestationData {
  attestation?: MintingAttestationIdsData;
  isFetchingAttestations?: boolean;
  refetch?: () => void;
}
interface TransactionHeaderProps {
  transactionHash: string;
  attestationUid?: string;
  transactionChainId: number;
  contributions?: Contribution[];
  attestationData: AttestationData;
}

export function TransactionHeader({
  transactionHash,
  transactionChainId,
  contributions = [],
  attestationData: { attestation, isFetchingAttestations, refetch },
}: TransactionHeaderProps) {
  const transactionLink = getTxBlockExplorerLink(
    transactionChainId,
    transactionHash
  );
  const parcialTransactionHash = truncateAddress(transactionHash, 5);

  return (
    <div className="bg-grey-75 rounded-lg gap-2 p-4 flex flex-col sm:flex-row items-center justify-between">
      <span className="font-medium font-mono text-base/[26px] whitespace-nowrap">
        <a
          className="flex items-center gap-[11px]"
          target={"_blank"}
          href={transactionLink}
        >
          {`Transaction #${parcialTransactionHash}`}
          <ArrowTopRightOnSquareIcon className="size-4 text-black" />
        </a>
      </span>
      <MintingActionButton
        transaction={{ hash: transactionHash, chainId: transactionChainId }}
        contributions={contributions}
        attestationData={{ attestation, isFetchingAttestations, refetch }}
      />
    </div>
  );
}
