import { useMemo } from "react";

import { MintingAttestationIdsData, useDataLayer } from "data-layer";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export type MintingAttestationsResponse = Omit<
  UseQueryResult<MintingAttestationIdsData[], Error>,
  "data"
> & { data?: Record<string, MintingAttestationIdsData[]> };

export const useMintingAttestations = (
  transactionHashes: string[] = []
): MintingAttestationsResponse => {
  const dataLayer = useDataLayer();

  const attestationsResponse = useQuery({
    queryKey: ["attestations", transactionHashes],
    queryFn: async () => {
      const response =
        await dataLayer.getMintingAttestationIdsByTransactionHash({
          transactionHashes,
        });
      return response.sort((a, b) => {
        const aTimestamp = a.attestation.timestamp;
        const bTimestamp = b.attestation.timestamp;
        return bTimestamp < aTimestamp ? -1 : 1;
      });
    },
    enabled: !!transactionHashes && transactionHashes.length > 0,
  });

  const attestations = useMemo<
    Record<string, MintingAttestationIdsData[]> | undefined
  >(() => {
    if (!attestationsResponse.data) return attestationsResponse.data;
    const attestationsByTransactionHash: Record<
      string,
      MintingAttestationIdsData[]
    > = {};
    attestationsResponse.data.forEach((attestation) => {
      const transactionHash = attestation.txnHash;
      if (!attestationsByTransactionHash[transactionHash]) {
        attestationsByTransactionHash[transactionHash] = [attestation];
      } else {
        attestationsByTransactionHash[transactionHash].push(attestation);
      }
    });
    return attestationsByTransactionHash;
  }, [attestationsResponse.data]);

  return {
    ...attestationsResponse,
    data: attestations,
  };
};
