/** MerklePayoutStrategy contract ABI in Human Readable ABI Format  */

const merklePayoutStrategy = [
  "event DistributionUpdated(bytes32 merkleRoot, tuple(uint256 protocol, string pointer) distributionMetaPtr)",
  "function distributionMetaPtr() view returns (uint256 protocol, string pointer)",
  "function init()",
  "function merkleRoot() view returns (bytes32)",
  "function roundAddress() view returns (address)",
  "function updateDistribution(bytes encodedDistribution)",
];

export default merklePayoutStrategy;
