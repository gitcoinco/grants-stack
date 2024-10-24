import { useQuery } from "@tanstack/react-query";
import { AttestationChainId } from "../../features/attestations/utils/constants";

/**
 * Hook to fetch attestation data based on a transaction hash.
 */
export const useGetAttestationData = (
  transactionHashes: string[],
  isLoading: boolean,
  selectedColor: string
) => {
  return useQuery({
    queryKey: [
      "getAttestationData",
      transactionHashes,
      selectedColor,
      isLoading,
    ],
    enabled: !isLoading && !!selectedColor,
    queryFn: async () => {
      if (!transactionHashes || transactionHashes.length === 0) {
        throw new Error("TransactionHashes are required");
      }

      const body = JSON.stringify({
        transactionHashes,
        chainId: AttestationChainId,
        backgroundOption: selectedColor,
      });

      try {
        const response = await fetch(
          `https://attestation.gitcoin.co/api/getAttestation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // Update the body to match real data
            body,
            mode: "cors",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        return {
          data: data.signedAttestation,
          impactImageCid: data.impactImageCid,
        };
      } catch (error) {
        console.error("Error fetching attestation data:", error);
        throw error;
      }
    },
  });
};
