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

      try {
        const response = await fetch(
          `http://localhost:3001/api/getAttestation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transactionHashes }),
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
