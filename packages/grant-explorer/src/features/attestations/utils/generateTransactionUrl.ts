export const generateTransactionUrl = ({
  chainId,
  attestationUid,
}: {
  chainId?: number;
  attestationUid?: string;
}) => {
  if (!chainId || !attestationUid) return "";
  switch (chainId) {
    case 11155111:
      return `https://sepolia.easscan.org/attestation/view/${attestationUid}`;
    case 42161:
      return `https://arbitrum.easscan.org/attestation/view/${attestationUid}`;
    default:
      return "";
  }
};
