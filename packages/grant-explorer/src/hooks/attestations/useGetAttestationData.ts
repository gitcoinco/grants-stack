import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch attestation data based on a transaction hash.
 */
export const useGetAttestationData = (transactionHashes: string[]) => {
  return useQuery({
    queryKey: ["attestation", transactionHashes],
    queryFn: async () => {
      if (!transactionHashes) {
        throw new Error("TransactionHashes are required");
      }

      const hashesToUse = [
        "0x3e12de5018a441e56e460556f3583fa47eeabc4d547f2733457516dacd045186",
      ];
      const chainIdToUse = 11155111;
      try {
        const response = await fetch(
          `https://gitcoin-server-api.vercel.app/api/getAttestation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // Update the body to match real data
            body: JSON.stringify({
              transactionHashes: hashesToUse,
              chainId: chainIdToUse,
            }),
            mode: "cors",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching attestation data:", error);
        throw error;
      }
    },
  });
};
