import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  useQuery,
} from "@apollo/client";
import gql from "graphql-tag";
import { useNetwork } from "wagmi";
import { Metadata, RoundApplicationMetadata, RoundMetadata } from "../types";

export const healthClient = new ApolloClient({
  uri: "https://api.thegraph.com/index-node/graphql",
  cache: new InMemoryCache(),
});

export const goerliClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/danielesalatti/project-registry-goerli",
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const roundManagerGoerliClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/thelostone-mc/program-factory-v0",
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const optimismKovanClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/danielesalatti/project-registry-optimism-kovan",
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const roundManagerOptimismKovanClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/thelostone-mc/grants-round-optimism-kovan",
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const roundManagerOptimismClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/thelostone-mc/grants-round-optimism-mainnet",
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const IS_APPLIED_TO_ROUND = gql`
  query hasAppliedToRounds($projectId: ID!) {
    rounds(where: { projects_: { project: $projectId } }) {
      id
      projects {
        id
      }
    }
  }
`;

export const SUBGRAPH_HEALTH = gql`
  query health($name: Bytes) {
    indexingStatusForCurrentVersion(subgraphName: $name, subgraphError: allow) {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`;

export const FETCH_PROJECTS_BY_ACCOUNT_ADDRESS = gql`
  query projectsByAccountAddress($address: ID!) {
    projects(where: { accounts_: { account: $address } }) {
      id
      accounts {
        id
        account {
          id
          address
        }
      }
      metaPtr {
        id
        pointer
        protocol
      }
    }
  }
`;

export const FETCH_PROJECT_BY_PROJECT_ID = gql`
  query projectById($id: ID!) {
    project(id: $id) {
      id
      accounts {
        id
        account {
          id
          address
        }
      }
      metaPtr {
        id
        pointer
        protocol
      }
    }
  }
`;

export const FETCH_ROUND_BY_ADDRESS = gql`
  query roundByAddress($id: ID!) {
    round(id: $id) {
      id
      applicationsStartTime
      applicationsEndTime
      applicationMetaPtr {
        id
        pointer
        protocol
      }
      roundMetaPtr {
        id
        pointer
        protocol
      }
    }
  }
`;

interface HealthResponse {
  indexingStatusForCurrentVersion: {
    chains: {
      chainHeadBlock: {
        number: string;
      };
      latestBlock: {
        number: string;
      };
    }[];
    synced: boolean;
    health: string;
    fatalError: {
      message: string;
      block: {
        number: string;
        hash: string;
      };
      handler: string;
    };
  };
}

export function useFetchedSubgraphStatus(): {
  available: boolean | null;
  syncedBlock: number | undefined;
  headBlock: number | undefined;
  healthy: boolean | null;
} {
  const { chain } = useNetwork();

  const { loading, error, data } = useQuery<HealthResponse>(SUBGRAPH_HEALTH, {
    client: healthClient,
    fetchPolicy: "no-cache",
    variables: {
      name:
        chain?.id === 69
          ? "danielesalatti/project-registry-optimism-kovan"
          : "danielesalatti/project-registry-goerli",
    },
  });

  const parsed = data?.indexingStatusForCurrentVersion;

  if (loading) {
    return {
      available: null,
      syncedBlock: undefined,
      headBlock: undefined,
      healthy: null,
    };
  }

  if ((!loading && !parsed) || error) {
    return {
      available: false,
      syncedBlock: undefined,
      headBlock: undefined,
      healthy: null,
    };
  }

  const syncedBlock = parsed?.chains[0].latestBlock.number;
  const headBlock = parsed?.chains[0].chainHeadBlock.number;
  const healthy = parsed?.health === "healthy";

  return {
    available: true,
    syncedBlock: syncedBlock ? parseFloat(syncedBlock) : undefined,
    headBlock: headBlock ? parseFloat(headBlock) : undefined,
    healthy,
  };
}

export type BaseProject = {
  id: string;
  accounts?: {
    id: string;
    account: {
      address: string;
    };
  };
  metaPtr: {
    id: string;
    pointer: string;
    protocol: string;
  };
  metadata?: Metadata;
};

export type BaseRound = {
  id: string;
  applicationsStartTime: string;
  applicationsEndTime: string;
  applicationMetaPtr: {
    id: string;
    pointer: string;
    protocol: number;
  };
  roundStartTime: string;
  roundEndTime: string;
  roundMetaPtr: {
    id: string;
    pointer: string;
    protocol: number;
  };
  token: string;
  metadata?: RoundMetadata;
  applicationMetadata?: RoundApplicationMetadata;
};

export type ProjectResponse = {
  project: BaseProject;
};

export type ProjectsResponse = {
  projects: BaseProject[];
};

export type RoundResponse = {
  round: BaseRound;
};

export type RoundIds = {
  id: string;
  projects: BaseProject[];
};

export type RoundAppliedResponse = {
  rounds: RoundIds[];
};

export async function fetchIfUserHasAppliedToRound(
  client: ApolloClient<NormalizedCacheObject>,
  id: string
): Promise<RoundAppliedResponse | null> {
  const { loading, error, data } = await client.query<RoundAppliedResponse>({
    query: IS_APPLIED_TO_ROUND,
    fetchPolicy: "no-cache",
    variables: {
      projectId: id,
    },
  });
  const parsed = data?.rounds;

  if (loading) return null;
  if ((!loading && !parsed) || error) return null;

  return {
    rounds: parsed!,
  };
}

export async function fetchProjectsByAccountAddress(
  client: ApolloClient<NormalizedCacheObject>,
  address: string
): Promise<ProjectsResponse | null> {
  const { loading, error, data } = await client.query<ProjectsResponse>({
    query: FETCH_PROJECTS_BY_ACCOUNT_ADDRESS,
    fetchPolicy: "no-cache",
    variables: {
      address: address?.toLowerCase(),
    },
  });

  const parsed = data?.projects;

  if (loading) {
    return null;
  }

  if ((!loading && !parsed) || error) {
    return null;
  }

  return {
    projects: parsed!,
  };
}

export async function fetchProjectById(
  client: ApolloClient<NormalizedCacheObject>,
  id: number
): Promise<ProjectResponse | null> {
  const hexId: string = `0x${id.toString(16)}`.toLowerCase();

  const { loading, error, data } = await client.query<ProjectResponse>({
    query: FETCH_PROJECT_BY_PROJECT_ID,
    fetchPolicy: "no-cache",
    variables: {
      id: hexId,
    },
  });

  const parsed = data?.project;

  if (loading) {
    return null;
  }

  if ((!loading && !parsed) || error) {
    return null;
  }

  return {
    project: parsed!,
  };
}

export async function useFetchRoundByAddress(
  client: ApolloClient<NormalizedCacheObject>,
  address: string
): Promise<RoundResponse | null> {
  const { loading, error, data } = await client.query<RoundResponse>({
    query: FETCH_ROUND_BY_ADDRESS,
    fetchPolicy: "no-cache",
    variables: {
      id: address.toLowerCase(),
    },
  });

  const parsed = data?.round;

  if (loading) {
    return null;
  }

  if ((!loading && !parsed) || error) {
    return null;
  }

  return {
    round: parsed!,
  };
}
