# Data dependencies by page

## Project application page (ViewProjectDetails.tsx)

- `GetRoundById` (subgraph)

- gap (karma indexer)

- cart (localStorage via `zustand`)

- passport (`PassportVerifier.verifyCredential(...)`)

- round applications (indexer via the indexer client)

## Explore projects page (ExploreProjectsPage.tsx)

- category definition (hardcoded)

- collection definition (hardcoded)

- applications (search service via `GrantsStackDataClient`)

- cart (localStorage via `zustand`)

## Landing page (LandingPage.tsx)

- categories definition (hardcoded)

- collections definition (hardcoded)

- `GetRounds` (subgraph)

- round metadata (ipfs)

## Explore Rounds page (ExploreRoundsPage.tsx)

- `GetRounds` (subgraph)

- round metadata (ipfs)

## Single Round page (ViewRoundPage.tsx)

- wagmi's useToken
- cart (localStorage via `zustand`)
- `GetRoundById` (subgraph)
  - projects for a round
  - program of a round
  - payoutStrat of a round
  - votingStrat of a round
  - round and application
  - projectMetaPtr - seems to be null??

# Data queries

## GetRoundById (subgraph)

original:

```graphql
query GetRoundById($roundId: String) {
  rounds(where: { id: $roundId }) {
    id
    program {
      id
    }
    roundMetaPtr {
      protocol
      pointer
    }
    applicationMetaPtr {
      protocol
      pointer
    }
    applicationsStartTime
    applicationsEndTime
    roundStartTime
    roundEndTime
    token
    payoutStrategy {
      id
      strategyName
    }
    votingStrategy
    projectsMetaPtr {
      pointer
    }
    projects(first: 1000, where: { status: 1 }) {
      id
      project
      status
      applicationIndex
      metaPtr {
        protocol
        pointer
      }
    }
  }
}
```

new indexer graphql:

```graphql
{
  query {
    round(chainId: 424, id: "0x222EA76664ED77D18d4416d2B2E77937b76f0a35") {
      id
      chainId
      # program # not used anymore
      roundMetadataCid
      applicationMetadataCid
      applicationsStartTime
      applicationsEndTime
      donationsStartTime # roundStartTime
      donationsEndTime # roundEndTime
      matchTokenAddress
      # payStrategy
      # votingStrategy
      # projectsMetaPtr # XXX what is this? probably nothing
      applicationsByRoundIdAndChainId(
        first: 1000 # whene:{ status: 1 }
      ) {
        edges {
          node {
            # id # ?
            projectId
            status
            applicationIndex: id
            metadataCid
          }
        }
      }
    }
  }
}
```

## GetRounds (subgraph)

original:

```graphql
query GetRounds(
  $first: Int
  $orderBy: String
  $orderDirection: String
  $where: Round_filter
  $currentTimestamp: String
) {
  rounds(
    first: $first
    orderBy: $orderBy
    orderDirection: $orderDirection
    where: $where
  ) {
    id
    roundMetaPtr {
      protocol
      pointer
    }
    applicationsStartTime
    applicationsEndTime
    roundStartTime
    roundEndTime
    matchAmount
    token
    payoutStrategy {
      id
      strategyName
    }
    projects(first: 1000, where: { status: 1 }) {
      id
    }
  }
}
```

new indexer graphql:

```graphql
{
  query {
    rounds(
      first: 1000
    ) # condition: # needs to search by status and payout strategy
    {
      edges {
        node {
          id
          roundMetadataCid
          applicationsStartTime
          applicationsEndTime
          donationsStartTime
          donationsEndTime
          matchTokenAddress
          # payoutStrategy
          applicationsByRoundIdAndChainId(first: 1000) # where: { status: 1 }
          {
            edges {
              node {
                projectId
              }
            }
          }
        }
      }
    }
  }
}
```

## round metadata (ipfs)

```ts
fetch(https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid})
```

## gap (karma indexer)

```ts
fetch(
  `${process.env.REACT_APP_KARMA_GAP_INDEXER_URL}/grants/external-id/${projectRegistryId}`
);
```

## round applications (indexer via indexer client)

```ts
return useSWR([roundId, "/projects"], async ([roundId]) => {
  const applications = await client.getRoundApplications(
    getAddress(roundId.toLowerCase())
  );

  return applications.find(
    (app) => app.projectId === projectId && app.status === "APPROVED"
  );
});
```

new indexer graphql

```graphql
query {
  applications (condition: {projectId: "0x661adec1a01270a6f2d0fa694e85810429dbcbacfcb2aa42445c05badce85e39", status:APPROVED}) {
  
    edges {
      node {
        metadata
      }
    }
  }
}
```

The underlying indexer data is the same, so I assume that the data in graphql should be the same too.
