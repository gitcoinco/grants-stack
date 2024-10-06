import { useQuery } from "@tanstack/react-query";

// In-memory cache to store fetched attestation data
const fetchCache = new Map();

/**
 * Hook to fetch attestation data based on a transaction hash.
 */
export const useGetAttestationData = (
  transactionHashes: string[],
  getFile: () => Promise<string | undefined>,
  isLoading: boolean,
  selectedColor: string
) => {
  return useQuery({
    queryKey: ["getAttestationData", transactionHashes, selectedColor],
    enabled: !isLoading && !!selectedColor,
    queryFn: async () => {
      if (!transactionHashes) {
        throw new Error("TransactionHashes are required");
      }

      const image = await getFile();
      if (!image) {
        throw new Error("Image is required");
      }

      const hashesToUse = [
        // TODO - Remove this hardcoded hash - Use this for testing on Thankyou page
        // "0x3e12de5018a441e56e460556f3583fa47eeabc4d547f2733457516dacd045186",
        ...transactionHashes,
      ];
      const chainIdToUse = 11155111;

      // Generate a cache key from the request parameters
      const body = JSON.stringify({
        transactionHashes: hashesToUse,
        chainId: chainIdToUse,
        base64Image: image,
      });

      // // Check if we have a cached response for this key
      // if (fetchCache.has(body)) {
      //   return fetchCache.get(body);
      // }

      try {
        const response = await fetch(
          `https://gitcoin-server-api.vercel.app/api/getAttestation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // Update the body to match real data
            body: body,
            mode: "cors",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // Store the fetched data in cache
        // fetchCache.set(body, data);

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
