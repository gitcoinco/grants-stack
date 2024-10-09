export const mockTransactionHashes = ["hash1", "hash2"];
export const mockResponse = {
  attestationTxns: [
    {
      txnHash: "hash1",
      attestationUid: "uid1",
      attestationChainId: "chain1",
    },
    {
      txnHash: "hash1",
      attestationUid: "uid2",
      attestationChainId: "chain1",
    },
    {
      txnHash: "hash2",
      attestationUid: "uid3",
      attestationChainId: "chain2",
    },
  ],
};

export const mockEmptyTransactionHashes = [];
export const mockEmptyResponse = {
  attestationTxns: [],
};
