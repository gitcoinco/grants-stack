export type MintingAttestationIdsData = {
  txnHash: string;
  attestationUid: string;
  attestationChainId: string;
  attestation: {
    metadata: {
      impactImageCid: string;
    }[];
    timestamp: string;
  };
};
