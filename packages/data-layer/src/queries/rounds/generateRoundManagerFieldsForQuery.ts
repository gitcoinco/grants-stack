export const generateRoundManagerFieldsForQuery = `
  id
  chainId
  applicationsStartTime
  applicationsEndTime
  donationsStartTime
  donationsEndTime
  matchTokenAddress
  roundMetadata
  roundMetadataCid
  applicationMetadata
  applicationMetadataCid
  strategyAddress
  strategyName
  readyForPayoutTransaction
  projectId
  matchAmount
  matchAmountInUsd
  createdByAddress
  fundedAmount
  fundedAmountInUsd
  matchingDistribution
  roles(first: 100) {
    role
    address
    createdAtBlock
  }
  tags
  project {
    id
    name
    metadata
  }
`;
