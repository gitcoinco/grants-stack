# Query invocations

## Project application page (ViewProjectDetails.tsx)

- `GetRoundById`
- gap
- cart
- passport verification
- approved applications for project

## Explore projects page (ExploreProjectsPage.tsx)

- category definitions
- collection definitions
- applications
- cart

## Landing page (LandingPage.tsx)

- categories definitions
- collections definitions
- `GetRounds`
- round metadata

## Explore Rounds page (ExploreRoundsPage.tsx)

- `GetRounds`
- round metadata

## Single Round page (ViewRoundPage.tsx)

- cart
- `GetRoundById`

# Query implementations

## GetRoundById

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

```ts
const roundMetadata: RoundMetadata = await fetchFromIPFS(
  round.roundMetaPtr.pointer
);
```

```ts
const approvedProjectsWithMetadata = await loadApprovedProjectsMetadata(
  round,
  chainId
);
```

```graphql
query GetProjectOwners($projectRegistryId: String) {
  projects(where: { id: $projectRegistryId }) {
    id
    accounts {
      account {
        address
      }
    }
  }
}
```

new: indexer graphql

```graphql
# new query requires `chainId` whereas previous one didn't
query GetRoundByIdNew($roundId: String!, $chainId: Int!) {
  round(chainId: $chainId, id: $roundId) {
    id
    chainId
    # payoutStrategy # not currently available but scheduled for addition to the indexer
    # votingStrategy # not currently available but scheduled for addition to the indexer
    # projectsMetaPtr # no longer used
    # program # no longer used
    roundMetadata
    applicationMetadata
    applicationsStartTime
    applicationsEndTime
    donationsStartTime # previously named roundStartTime
    donationsEndTime # previously named roundEndTime
    matchTokenAddress
    applications(first: 1000, condition: { status: APPROVED }) {
      applicationIndex: id
      projectId
      status
      metadata
    }
    # MISSING: GetProjectOwners
  }
}
```

variables for testing in graphiql:

```json
{
  "roundId": "0x222EA76664ED77D18d4416d2B2E77937b76f0a35",
  "chainId": 424
}
```

## GetRounds

before: subgraph

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

new: indexer graphql

```graphql
query GetRoundsNew(
  $first: Int
  $orderBy: [RoundsOrderBy!] # includes previous "orderBy" and "orderDirection",
) {
  # $currentTimestamp # no longer used
  # $where # usage needs to be investigated and adapted to `condition`

  query {
    rounds(first: $first, orderBy: $orderBy) {
      id
      roundMetadata
      applicationsStartTime
      applicationsEndTime
      donationsStartTime
      donationsEndTime
      matchTokenAddress
      # payoutStrategy # not currently available but scheduled for addition to the indexer
      applications(first: 1000, condition: { status: APPROVED }) {
        projectId
      }
    }
  }
}
```

## round metadata

before: ipfs

```ts
fetch(https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid})
```

new: indexer graphql

see `GetRoundByIdNew`

## gap

before: karma indexer

```ts
fetch(
  `${process.env.REACT_APP_KARMA_GAP_INDEXER_URL}/grants/external-id/${projectRegistryId}`
);
```

new: unchanged

## approved applications for project

before: indexer via indexer client

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

new: indexer graphql

```graphql
query GetApprovedApplicationsForProject($projectId: String!) {
  applications(condition: { projectId: $projectId, status: APPROVED }) {
    metadata
  }
}
```

variables for testing in graphiql:

```json
{
  "projectId": "0x661adec1a01270a6f2d0fa694e85810429dbcbacfcb2aa42445c05badce85e39"
}
```

## passport verification

before:

```ts
PassportVerifier.verifyCredential(...)
```

new: unchanged

## cart

before: localStorage via `zustand`

new: unchanged

## category definitions

before: hardcoded

new: unchanged

## collection definitions

before: hardcoded

new: unchanged

## applications matching keywords

before: search service `GrantsStackDataClient`

new: unchanged
