import { useQuery } from "@tanstack/react-query";
import { AttestationChainId } from "../../features/attestations/utils/constants";
import { ethers } from "ethers";

/**
 * Hook to fetch attestation data based on a transaction hash.
 */
export const useGetAttestationData = (
  transactionHashes: string[],
  getImpactImageData: (txHash: string) => Promise<string | undefined>,
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

      const frameId = ethers.utils.solidityKeccak256(
        ["string[]"],
        [transactionHashes]
      );

      const image = await getImpactImageData(frameId);

      if (!image) {
        throw new Error("Image is required");
      }
      // Generate a cache key from the request parameters
      const body = JSON.stringify({
        transactionHashes,
        chainId: AttestationChainId,
        base64Image: image,
      });

      try {
        const response = await fetch(
          `https://gitcoin-server-api.vercel.app/api/getAttestation`,
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

        console.log("Attestation data:", data);

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
