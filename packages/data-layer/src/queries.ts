import { gql } from "graphql-request";

/**
 * Manager: Get all the programs that a user is a part of
 * @param $address - The address of the user
 * @param $chainId - The network ID of the chain
 * @param $tag - The tag of the program
 *
 * @returns The programs
 */
export const getProgramByUserAndTag = gql`
  query ($address: String!, $chainId: Int!, $filterByTag: String!) {
    projects(
      filter: {
        tags: { contains: [$filterByTag] }
        roles: { some: { address: { equalTo: $address } } }
        chainId: { equalTo: $chainId }
      }
    ) {
      id
      chainId
      metadata
      metadataCid
      tags
      roles {
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
export const getProgramByIdAndUser = gql`
  query ($userAddress: String!, $programId: String!, $chainId: Int!) {
    projects(
      filter: {
        id: { equalTo: $programId }
        roles: { some: { address: { equalTo: $userAddress } } }
        chainId: { equalTo: $chainId }
      }
    ) {
      id
      chainId
      metadata
      metadataCid
      tags
      roles {
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
 * @param $chainId - The network ID of the chain
 *
 * @returns The project
 */
export const getProjectById = gql`
  query ($alloVersion: [String!]!, $projectId: String!, $chainId: Int!) {
    projects(
      filter: {
        tags: { equalTo: $alloVersion }
        not: { tags: { contains: "program" } }
        id: { equalTo: $projectId }
        and: { chainId: { equalTo: $chainId } }
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
      roles {
        address
        role
        createdAtBlock
      }
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
    }
  }
`;

export const getApplicationsByProjectId = gql`
  query getApplicationsByProjectId($projectId: String!, $chainIds: [Int!]!) {
    applications(
      filter: {
        project: { id: { equalTo: $projectId }, chainId: { in: $chainIds } }
      }
    ) {
      id
      chainId
      roundId
      status
      metadataCid
      metadata
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

export const getApplication = gql`
  query Application(
    $chainId: Int!
    $applicationId: String!
    $roundId: String!
  ) {
    application(chainId: $chainId, id: $applicationId, roundId: $roundId) {
      id
      chainId
      roundId
      projectId
      status
      totalAmountDonatedInUsd
      uniqueDonorsCount
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
      }
    }
  }
`;

export const getProgramName = gql`
  query getProgramNameQuery($projectId: String!) {
    projects(filter: { id: { equalTo: $projectId } }) {
      metadata
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
      }
    }
  }
`;

export const getProjectsAndRolesByAddress = gql`
  query getProjectsAndRolesByAddressQuery(
    $address: String!
    $version: [String!]!
    $chainId: Int!
  ) {
    projects(
      filter: {
        roles: { every: { address: { equalTo: $address } } }
        tags: { contains: $version }
        not: { tags: { contains: "program" } }
        chainId: { equalTo: $chainId }
        rolesExist: true
      }
    ) {
      roles {
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
      createdAtBlock
      applications {
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
        filter: { chainId: { equalTo: $chainId }, toBlock: { equalTo: "latest" } }
      ) {
        chainId
        indexedToBlock
      }
    }
  }
`;

export const getRoundByIdAndChainId = gql`
  query getRoundByIdAndChainId($roundId: String!, $chainId: Int!) {
    rounds(
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
      strategyId
      strategyAddress
      strategyName
    }
  }
`;

export const getRoundsByProgramIdAndUserAddress = gql`
  query getRoundsByProgramIdAndMemberAddress(
    $chainId: Int!
    $programId: String!
    $userAddress: String!
  ) {
    rounds(
      filter: {
        chainId: { equalTo: $chainId }
        projectId: { equalTo: $programId }
        roles: { some: { address: { equalTo: $userAddress } } }
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
      roles {
        role
        address
        createdAtBlock
      }
    }
  }
`;
