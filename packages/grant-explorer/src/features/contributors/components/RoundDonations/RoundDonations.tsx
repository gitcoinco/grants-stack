import { DonationsTransactions } from "./DonationsTransactions";
import { ContributionsByHashAndRoundId } from "../../types";
import { useMintingAttestations } from "../../hooks/useMintingAttestations";

export function RoundDonations({
  title,
  contributions = {},
}: {
  title: string;
  contributions?: ContributionsByHashAndRoundId;
}) {
  const transactionHashes = Object.keys(contributions);

  const {
    data: mintingAttestations,
    isFetching,
    isLoading,
    refetch,
  } = useMintingAttestations(transactionHashes);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center h-[45px] border-black text-black text-lg/[26px] border-b font-modern-era-medium font-medium">
        {title}
      </div>
      {transactionHashes.length === 0 ? (
        <div className="text-md text-center">No Donations found</div>
      ) : (
        transactionHashes.map((transactionHash) => (
          <DonationsTransactions
            key={transactionHash}
            transactionHash={transactionHash}
            contributions={contributions[transactionHash]}
            transactionAttestationsData={{
              transactionAttestations: mintingAttestations?.[transactionHash],
              attestationUid:
                mintingAttestations?.[transactionHash]?.[0]?.attestationUid,
              isFetchingAttestations: isFetching || isLoading,
              refetch,
            }}
          />
        ))
      )}
    </div>
  );
}
