import { gql } from "graphql-request";

/**
 * Manager: Get all the programs that a user is a part of
 * @param $address - The address of the user
 * @param $chainId - The network ID of the chain
 * @param $tag - The tag of the program
 *
 * @returns The programs
 */
export const getProgramsByUserAndTag = gql`
  query ($userAddress: String!, $chainId: Int!, $tags: [String!]!) {
    projects(
      first: 100
      filter: {
        tags: { contains: $tags }
        chainId: { equalTo: $chainId }
        roles: { some: { address: { equalTo: $userAddress } } }
      }
    ) {
      id
      chainId
      metadata
      metadataCid
      tags
      createdByAddress
      roles(first: 1000) {
        address
        role
        createdAtBlock
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
      first: 1
      filter: { id: { equalTo: $programId }, chainId: { equalTo: $chainId } }
    ) {
      id
      chainId
      metadata
      metadataCid
      tags
      createdByAddress
      roles(first: 1000) {
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
  query ($alloVersion: [String!]!, $projectId: String!) {
    projects(
      first: 100
      filter: {
        tags: { equalTo: $alloVersion }
        not: { tags: { contains: "program" } }
        id: { equalTo: $projectId }
      }
    ) {
      id
      chainId
      metadata
      metadataCid
      name
      nodeId
      projectNumber
      registryAddress
      tags
      nonce
      anchorAddress
      projectType
      roles(first: 1000) {
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
    project(id: $projectId, chainId: $chainId) {
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
export const getLegacyProjectId = gql`
  query ($projectId: String!) {
    legacyProjects(first: 1, filter: { v2ProjectId: { equalTo: $projectId } }) {
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
  query getProjectsQuery(
    $alloVersion: [String!]!
    $first: Int!
    $chainId: Int!
  ) {
    projects(
      filter: {
        tags: { equalTo: $alloVersion }
        not: { tags: { contains: "program" } }
      }
      first: $first
      condition: { chainId: $chainId }
    ) {
      id
      chainId
      metadata
      metadataCid
      name
      nodeId
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
      first: 1000
      filter: { projectId: { in: $projectIds }, chainId: { in: $chainIds } }
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

export const getApplicationsForManager = gql`
  query getApplicationsForManager($chainId: Int!, $roundId: String!) {
    applications(
      first: 1000
      filter: { roundId: { equalTo: $roundId }, chainId: { equalTo: $chainId } }
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
      canonicalProject {
        roles {
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
      first: 1
      filter: {
        roundId: { equalTo: $roundId }
        chainId: { equalTo: $chainId }
        metadataCid: { equalTo: $metadataCid }
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
      first: 1
      condition: {
        status: APPROVED
        chainId: $chainId
        id: $applicationId
        roundId: $roundId
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
      project: canonicalProject {
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
      first: 1000
      condition: { chainId: $chainId, roundId: $roundId, status: APPROVED }
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
      project: canonicalProject {
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
      first: 1000
      filter: {
        chainId: { equalTo: $chainId }
        roundId: { equalTo: $roundId }
        projectId: { in: $projectIds }
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
    $role: ProjectRoleName!
    $version: String!
  ) {
    projectRoles(
      first: 100
      condition: { address: $address, chainId: $chainId, role: $role }
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

export const getProjectsAndRolesByAddress = gql`
  query getProjectsAndRolesByAddressQuery(
    $address: String!
    $version: [String!]!
    $chainIds: [Int!]!
  ) {
    projects(
      first: 1000
      filter: {
        roles: { every: { address: { equalTo: $address } } }
        tags: { contains: $version }
        not: { tags: { contains: "program" } }
        chainId: { in: $chainIds }
        rolesExist: true
      }
    ) {
      roles(first: 1000) {
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
      applications(first: 1000) {
        id
        metadata
      }
    }
  }
`;

export const getBlockNumberQuery = gql`
  query getBlockNumberQuery($chainId: Int!) {
    {
      subscriptions(
        first: 1000
        filter: { chainId: { equalTo: $chainId }, toBlock: { equalTo: "latest" } }
      ) {
        chainId
        indexedToBlock
      }
    }
  }
`;

export const getRoundsQuery = gql`
  query GetRounds(
    $first: Int
    $orderBy: [RoundsOrderBy!]
    $filter: RoundFilter
  ) {
    rounds(first: $first, orderBy: $orderBy, filter: $filter) {
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
      applications(first: 1000, filter: { status: { equalTo: APPROVED } }) {
        id
      }
    }
  }
`;

export const getRoundByIdAndChainId = gql`
  query getRoundByIdAndChainId($roundId: String!, $chainId: Int!) {
    rounds(
      first: 1
      filter: { id: { equalTo: $roundId }, chainId: { equalTo: $chainId } }
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
      roles(first: 100) {
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

export const getRoundForManager = gql`
  query getRoundForManager($roundId: String!, $chainId: Int!) {
    rounds(
      first: 1
      filter: { id: { equalTo: $roundId }, chainId: { equalTo: $chainId } }
    ) {
      ${getRoundForManagerFields}
    }
  }
`;

export const getRoundsForManager = gql`
  query getRoundsForManager($chainId: Int!, $programId: String!) {
    rounds(
      first: 1000
      filter: {
        chainId: { equalTo: $chainId }
        projectId: { equalTo: $programId }
      }
    ) {
      ${getRoundForManagerFields}
    }
  }
`;

export const getRoundForExplorer = gql`
  query getRoundForExplorer($roundId: String!, $chainId: Int!) {
    rounds(
      first: 1
      filter: { id: { equalTo: $roundId }, chainId: { equalTo: $chainId } }
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
      applications(first: 1000, filter: { status: { equalTo: APPROVED } }) {
        id
        projectId
        status
        metadata
        anchorAddress
        project: canonicalProject {
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
      first: 1000
      filter: {
        chainId: { in: $chainIds }
        donorAddress: { equalTo: $address }
      }
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
      round {
        roundMetadata
        donationsStartTime
        donationsEndTime
      }
      application {
        project: canonicalProject {
          name
        }
      }
    }
  }
`;
