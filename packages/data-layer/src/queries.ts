import { gql } from "graphql-request";

//Note: All the addresses used in query filters should be checksummed before being used

/**
 * Manager: Get all the programs that a user is a part of
 * @param $address - The address of the user
 * @param $chainId - The network ID of the chain
 * @param $tag - The tag of the program
 *
 * @returns The programs
 */
export const getProgramsByUserAndTag = gql`
  query ($userAddress: String!, $chainIds: [Int!]!, $tags: jsonb) {
    projects(
      orderBy: { timestamp: DESC }
      limit: 100
      where: {
        tags: { _contains: $tags }
        chainId: { _in: $chainIds }
        projectRoles: { address: { _eq: $userAddress } }
      }
    ) {
      id
      chainId
      metadata
      metadataCid
      tags
      createdByAddress
      projectRoles(limit: 100) {
        address
        role
        createdAtBlock
      }
      qfRounds: rounds(
        where: {
          strategyName: {
            _eq: "allov2.DonationVotingMerkleDistributionDirectTransferStrategy"
          }
        }
      ) {
        id
      }
      dgRounds: rounds(
        where: { strategyName: { _eq: "allov2.DirectGrantsLiteStrategy" } }
      ) {
        id
      }
    }
  }
`;

/**
 * Get a program by its programId
 * @param $alloVersion - The version of Allo
 * @param $programId - The ID of the program
 * @param $chainId - The network ID of the chain
 *
 * @returns The programs
 */
export const getProgramById = gql`
  query ($programId: String!, $chainId: Int!) {
    projects(
      limit: 1
      where: { id: { _eq: $programId }, chainId: { _eq: $chainId } }
    ) {
      id
      chainId
      metadata
      metadataCid
      tags
      createdByAddress
      projectRoles(limit: 100) {
        address
        role
        createdAtBlock
      }
    }
  }
`;

/**
 * Get a project by its ID
 * @param $alloVersion - The version of Allo
 * @param $projectId - The ID of the project
 *
 * @returns The project
 */
export const getProjectsById = gql`
  # @param $alloVersion - The version of Allo ex: "{allo-v2}"
  # @param $projectId - The ID of the project
  query ($alloVersion: String!, $projectId: String!) {
    projects(
      limit: 100
      where: {
        tags: { _hasKey: $alloVersion }
        projectType: { _eq: "canonical" }
        _not: { tags: { _contains: "program" } }
        id: { _eq: $projectId }
      }
    ) {
      id
      chainId
      metadata
      metadataCid
      name
      projectNumber
      registryAddress
      tags
      nonce
      anchorAddress
      projectType
      projectRoles(limit: 100) {
        address
        role
        createdAtBlock
      }
    }
  }
`;

/**
 * Get a project by its ID and chainId
 * @param $projectId - The ID of the project
 * @param $chainId - The chainId
 *
 * @returns The project
 */
export const getProjectAnchorByIdAndChainId = gql`
  query ($projectId: String!, $chainId: Int!) {
    projects(
      limit: 1
      where: { id: { _eq: $projectId }, chainId: { _eq: $chainId } }
    ) {
      anchorAddress
    }
  }
`;

/**
 * Get a getLegacyProjectId by its ID
 * @param $projectId - The Allo v2 ID of the project
 *
 * @returns The project
 */
//FIXME: Deprecated on indexer v2 ?
export const getLegacyProjectId = gql`
  query ($projectId: String!) {
    legacyProjects(limit: 1, where: { v2ProjectId: { _eq: $projectId } }) {
      v1ProjectId
    }
  }
`;

/**
 * Get projects by their address
 * @param $alloVersion - The version of Allo
 * @param $first - The number of projects to return
 * @param $chainId - The network ID of the chain
 *
 * @returns The project[]
 */
export const getProjects = gql`
  query getProjectsQuery($alloVersion: String!, $first: Int!, $chainId: Int!) {
    projects(
      where: {
        tags: { _contains: [$alloVersion] }
        _not: { tags: { _contains: "program" } }
        chainId: { _eq: $chainId }
      }
      limit: $first
    ) {
      id
      chainId
      metadata
      metadataCid
      name
      projectNumber
      registryAddress
      tags
      nonce
      anchorAddress
      projectType
    }
  }
`;

export const getApplicationsByProjectIds = gql`
  query getApplicationsByProjectIds(
    $projectIds: [String!]!
    $chainIds: [Int!]!
  ) {
    applications(
      limit: 100
      where: { projectId: { _in: $projectIds }, chainId: { _in: $chainIds } }
    ) {
      id
      projectId
      chainId
      roundId
      status
      metadataCid
      metadata
      totalDonationsCount
      totalAmountDonatedInUsd
      uniqueDonorsCount
      round {
        applicationsStartTime
        applicationsEndTime
        donationsStartTime
        donationsEndTime
        roundMetadata
        strategyName
      }
    }
  }
`;

export const getApprovedApplicationsByProjectIds = gql`
  query getApprovedApplicationsByProjectIds($projectIds: [String!]!) {
    applications(
      limit: 100
      where: { projectId: { _in: $projectIds }, status: { _eq: APPROVED } }
    ) {
      id
      projectId
      chainId
      roundId
      status
      metadataCid
      metadata
      totalDonationsCount
      totalAmountDonatedInUsd
      uniqueDonorsCount
      round {
        applicationsStartTime
        applicationsEndTime
        donationsStartTime
        donationsEndTime
        roundMetadata
        project {
          name
        }
        strategyName
      }
    }
  }
`;

export const getApplicationsForManager = gql`
  query getApplicationsForManager($chainId: Int!, $roundId: String!) {
    applications(
      limit: 100
      where: { roundId: { _eq: $roundId }, chainId: { _eq: $chainId } }
    ) {
      id
      projectId
      chainId
      roundId
      status
      metadataCid
      metadata
      distributionTransaction
      statusSnapshots
      anchorAddress
      round {
        strategyName
        strategyAddress
      }
      project {
        projectRoles {
          address
        }
      }
    }
  }
`;

export const getApplicationStatusByRoundIdAndCID = gql`
  query getApplicationStatusByRoundIdAndCID(
    $roundId: String!
    $chainId: Int!
    $metadataCid: String!
  ) {
    applications(
      limit: 1
      where: {
        roundId: { _eq: $roundId }
        chainId: { _eq: $chainId }
        metadataCid: { _eq: $metadataCid }
      }
    ) {
      status
    }
  }
`;

export const getApprovedApplication = gql`
  query Application(
    $chainId: Int!
    $applicationId: String!
    $roundId: String!
  ) {
    applications(
      limit: 1
      where: {
        status: { _eq: APPROVED }
        chainId: { _eq: $chainId }
        id: { _eq: $applicationId }
        roundId: { _eq: $roundId }
      }
    ) {
      id
      chainId
      roundId
      projectId
      status
      totalAmountDonatedInUsd
      uniqueDonorsCount
      totalDonationsCount
      anchorAddress
      round {
        strategyName
        donationsStartTime
        donationsEndTime
        applicationsStartTime
        applicationsEndTime
        matchTokenAddress
        roundMetadata
      }
      metadata
      project {
        tags
        id
        metadata
        anchorAddress
      }
    }
  }
`;

export const getApplicationsForExplorer = gql`
  query Applications($chainId: Int!, $roundId: String!) {
    applications(
      limit: 100
      where: {
        chainId: { _eq: $chainId }
        roundId: { _eq: $roundId }
        status: { _eq: "APPROVED" }
      }
    ) {
      id
      chainId
      roundId
      projectId
      status
      totalAmountDonatedInUsd
      uniqueDonorsCount
      totalDonationsCount
      anchorAddress
      round {
        strategyName
        donationsStartTime
        donationsEndTime
        applicationsStartTime
        applicationsEndTime
        matchTokenAddress
        roundMetadata
      }
      metadata
      project {
        tags
        id
        metadata
        anchorAddress
      }
    }
  }
`;

export const getApplicationsByRoundIdAndProjectIds = gql`
  query Application(
    $chainId: Int!
    $roundId: String!
    $projectIds: [String!]!
  ) {
    applications(
      limit: 100
      where: {
        chainId: { _eq: $chainId }
        roundId: { _eq: $roundId }
        projectId: { _in: $projectIds }
      }
    ) {
      id
      projectId
      chainId
      roundId
      status
      metadataCid
      metadata
      anchorAddress
      round {
        applicationsStartTime
        applicationsEndTime
        donationsStartTime
        donationsEndTime
        roundMetadata
      }
    }
  }
`;

/**
 * Get projects by their address
 * @param $address - The address of the project
 * @param $chainId - The network ID of the chain
 * @param $role - The role of the project
 *
 * @returns The project[]
 */
// todo: add version
export const getProjectsByAddress = gql`
  query getProjectsByAddressQuery(
    $address: String!
    $chainId: Int!
    $role: project_role_name!
  ) {
    projectRoles(
      limit: 100
      where: {
        address: { _eq: $address }
        chainId: { _eq: $chainId }
        role: { _eq: $role }
      }
    ) {
      projectId
      project {
        chainId
        createdAtBlock
        registryAddress
        projectNumber
        tags
        nonce
        anchorAddress
        projectType
      }
    }
  }
`;

/**
 * Get active projects in the given range
`* @param $first - The number of projects to return
 * @param $offset - The offset of the projects
 *
 * @returns The v2Projects
 */
export const getPaginatedProjects = gql`
  query getPaginatedProjects($first: Int!, $offset: Int!) {
    projects(
      where: {
        metadata: { _isNull: false }
        tags: { _contains: "allo-v2" }
        _not: { tags: { _contains: "program" } }
        chainId: {
          _in: [
            1
            137
            10
            324
            42161
            42220
            43114
            534352
            8453
            1329
            100
            42
            1088
          ]
        }
          //TODO: Not sure if removing rounds filter is correct 
      }
      limit: $first
      offset: $offset
    ) {
      id
      chainId
      metadata
      metadataCid
      name
      projectNumber
      registryAddress
      tags
      nonce
      anchorAddress
      projectType
    }
  }
`;

/**
 * Get projects by search term
 * @param $searchTerm - The search term
`* @param $first - The number of projects to return
 * @param $offset - The offset of the projects
 *
 * @returns The v2Projects
 */
export const getProjectsBySearchTerm = gql`
  query getProjectsBySearchTerm(
    $searchTerm: String!
    $first: Int!
    $offset: Int!
  ) {
    searchProjects(
      args: { search_term: $searchTerm }
      limit: $first
      offset: $offset
      where: {
        metadata: { _isNull: false }
        tags: { _contains: "allo-v2" }
        _not: { tags: { _contains: "program" } }
        chainId: {
          _in: [
            1
            137
            10
            324
            42161
            42220
            43114
            534352
            8453
            1329
            100
            42
            1088
          ]
        }
        //TODO: Not sure if removing rounds filter is correct 

      }
    ) {
      id
      chainId
      metadata
      metadataCid
      name
      projectNumber
      registryAddress
      tags
      nonce
      anchorAddress
      projectType
    }
  }
`;

export const getProjectsAndRolesByAddress = gql`
  query getProjectsAndRolesByAddressQuery(
    $address: String!
    $version: String!
    $chainIds: [Int!]!
  ) {
    projects(
      limit: 100
      where: {
        projectRoles: { address: { _eq: $address } }
        tags: { _contains: [$version] }
        _not: { tags: { _contains: "program" } }
        chainId: { _in: $chainIds }
      }
    ) {
      projectRoles(limit: 100) {
        role
        address
        projectId
      }
      name
      registryAddress
      chainId
      metadata
      metadataCid
      projectNumber
      tags
      id
      nonce
      anchorAddress
      projectType
      createdAtBlock
      applications(limit: 100) {
        id
        metadata
      }
    }
  }
`;

//NOT SUPPORTED ON THE CURRENT INDEXER
// export const getBlockNumberQuery = gql`
//   query getBlockNumberQuery($chainId: Int!) {
//     {
//       subscriptions(
//         first: 100
//         filter: { chainId: { equalTo: $chainId }, toBlock: { equalTo: "latest" } }
//       ) {
//         chainId
//         indexedToBlock
//       }
//     }
//   }
// `;

//TODO: migrate code in which this query is called
export const getRoundsQuery = gql`
  query GetRounds(
    $first: Int
    $orderBy: [RoundsOrderBy!]
    $filter: RoundsBoolExp
  ) {
    rounds(limit: $first, orderBy: $orderBy, where: $filter) {
      id
      chainId
      tags
      roundMetadata
      roundMetadataCid
      applicationsStartTime
      applicationsEndTime
      donationsStartTime
      donationsEndTime
      matchAmountInUsd
      matchAmount
      matchTokenAddress
      strategyId
      strategyName
      strategyAddress
      applications(limit: 100) {
        id
        status
      }
    }
  }
`;

export const getRoundByIdAndChainId = gql`
  query getRoundByIdAndChainId($roundId: String!, $chainId: Int!) {
    rounds(
      limit: 1
      where: {
        id: { _eq: $roundId }
        chainId: { _eq: $chainId }
        roundMetadata: { _isNull: false }
      }
    ) {
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
      roundRoles(limit: 100) {
        role
        address
      }
      project {
        id
        name
        metadata
      }
      tags
    }
  }
`;

const getRoundForManagerFields = `
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
  roundRoles(limit: 100) {
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

export const getRoundForManager = gql`
  query getRoundForManager($roundId: String!, $chainId: Int!) {
    rounds(
      limit: 1
      where: { 
        id: { _eq: $roundId },
        chainId: { _eq: $chainId },
        roundMetadata: { _isNull: false }
      }
    ) {
      ${getRoundForManagerFields}
    }
  }
`;

export const getRoundsForManager = gql`
  query getRoundsForManager($chainId: Int!, $programId: String!) {
    rounds(
      orderBy: {timestamp:DESC}
      limit: 100
      where: {
        chainId: { _eq: $chainId }
        projectId: { _eq: $programId }
        roundMetadata: { _isNull: false }
      }
    ) {
      ${getRoundForManagerFields}
  	}
  }
`;

export const getRoundsForManagerByAddress = gql`
  query getRoundsForManager($chainIds: [Int!]!, $address: String!) {
    rounds(
      orderBy: {timestamp:DESC}
      limit: 100
      where: {
        roundMetadata: { _isNull: false },
        chainId: { _in: $chainIds}, 
        roundRoles: {
            address: {
              _eq: $address
          }
        }
      }
    ) {
    	${getRoundForManagerFields}
    }
  }
`;

export const getRoundForExplorer = gql`
  query getRoundForExplorer($roundId: String!, $chainId: Int!) {
    rounds(
      limit: 1
      where: {
        id: { _eq: $roundId }
        chainId: { _eq: $chainId }
        roundMetadata: { _isNull: false }
      }
    ) {
      id
      chainId
      uniqueDonorsCount
      applicationsStartTime
      applicationsEndTime
      donationsStartTime
      donationsEndTime
      matchTokenAddress
      roundMetadata
      roundMetadataCid
      applicationMetadata
      applicationMetadataCid
      strategyId
      projectId
      strategyAddress
      strategyName
      readyForPayoutTransaction
      applications(limit: 100, where: { status: { _eq: APPROVED } }) {
        id
        projectId
        status
        metadata
        anchorAddress
        project {
          id
          metadata
          anchorAddress
        }
      }
    }
  }
`;

export const getDonationsByDonorAddress = gql`
  query getDonationsByDonorAddress($address: String!, $chainIds: [Int!]!) {
    donations(
      limit: 100
      where: { chainId: { _in: $chainIds }, donorAddress: { _eq: $address } }
    ) {
      id
      chainId
      projectId
      roundId
      recipientAddress
      applicationId
      tokenAddress
      donorAddress
      amount
      amountInUsd
      transactionHash
      blockNumber
      timestamp
      round {
        roundMetadata
        donationsStartTime
        donationsEndTime
        strategyName
      }
      application {
        project {
          name
          metadata
          projectType
        }
      }
    }
  }
`;

export const getPayoutsByChainIdRoundIdProjectId = gql`
  query getPayoutsByChainIdRoundIdRecipientId(
    $chainId: Int!
    $roundId: String!
    $projectId: String!
  ) {
    rounds(where: { chainId: { _eq: $chainId }, id: { _eq: $roundId } }) {
      id
      applications(where: { projectId: { _eq: $projectId } }) {
        id
        applicationsPayouts {
          id
          tokenAddress
          amount
          amountInUsd
          transactionHash
          timestamp
          sender
        }
      }
    }
  }
`;

// 0x4cd0051913234cdd7d165b208851240d334786d6e5afbb4d0eec203515a9c6f3 == DirectDonationsStrategy Id
export const getDirectDonationsByProjectId = gql`
  query getDirectDonationsByProjectId($chainIds: [Int!]!, $projectId: String!) {
    rounds(
      where: {
        strategyId: {
          _eq: "0x4cd0051913234cdd7d165b208851240d334786d6e5afbb4d0eec203515a9c6f3"
        }
        chainId: { _in: $chainIds }
      }
    ) {
      donations(where: { projectId: { _eq: $projectId } }) {
        id
        amount
        donorAddress
        amountInUsd
        projectId
      }
    }
  }
`;
