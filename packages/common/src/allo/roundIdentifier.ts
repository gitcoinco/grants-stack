export type RoundType =
  | "MERKLE"
  | "DIRECT"
  | "SUPERFLUID"
  | "MICROGRANTS"
  | "MICROGRANTSGOV"
  | "MICROGRANTSHATS"
  | "RFPSIMPLE"
  | "RFPCOMMITTEE"
  | "QVSIMPLE";

export const getV2RoundType = (poolId: string): RoundType => {
  const lowerCasePoolId = poolId.toLowerCase();
  switch (lowerCasePoolId) {
    case "0x6f9291df02b2664139cec5703c124e4ebce32879c74b6297faa1468aa5ff9ebf": // DonationVotingMerkleDistributionDirectTransferStrategyv1.0
    case "0x7e75375f0a7cd9f7ea159c8b065976e4f764f9dcef1edf692f31dd1842f70c87": // DonationVotingMerkleDistributionVaultStrategyv1.0
    case "0x2f46bf157821dc41daa51479e94783bb0c8699eac63bf75ec450508ab03867ce": // DonationVotingMerkleDistributionDirectTransferStrategy v1.1
    case "0x093072375737c0e8872fef36808849aeba7f865e182d495f2b98308115c9ef13": // DonationVotingMerkleDistributionVaultStrategy v1.1
      return "MERKLE";

    case "0xf8a14294e80ff012e54157ec9d1b2827421f1e7f6bde38c06730b1c031b3f935": // SQFSuperfluidv1
      return "SUPERFLUID";

    case "0x697f0592ebd05466d2d24454477e11d69c475d7a7c4134f15ddc1ea9811bb16f": // MicroGrantsv1
      return "MICROGRANTS";

    case "0x741ac1e2f387d83f219f6b5349d35ec34902cf94019d117335e0045d2e0ed912": // MicroGrantsGovv1
      return "MICROGRANTSGOV";

    case "0x5aa24dcfcd55a1e059a172e987b3456736b4856c71e57aaf52e9a965897318dd": // MicroGrantsHatsv1
      return "MICROGRANTSHATS";

    case "0x0d459e12d9e91d2b2a8fa12be8c7eb2b4f1c35e74573990c34b436613bc2350f": // RFPSimpleStrategyv1.0
      return "RFPSIMPLE";

    case "0x7d143166a83c6a8a303ae32a6ccd287e48d79818f5d15d89e185391199909803": // RFPCommitteeStrategyv1.0
      return "RFPCOMMITTEE";

    case "0x22d006e191d6dc5ff1a25bb0733f47f64a9c34860b6703df88dea7cb3987b4c3": // QVSimpleStrategyv1.0
      return "QVSIMPLE";

    default:
      throw new Error("RoundType: Unknown Identifier");
  }
};
