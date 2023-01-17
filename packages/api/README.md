# api

This package is pulumi configured app which offers API / endpoints to:

- calculate the matching distribution for a given round based on the voting strategy
- store the results of a calculations
- return the latest distribution of funds within the round
- return a specifc project's matching amount within a round

This package is meant to be used by the round operators to

- view how the matching funds distributions evolve during the course of a round
- determine how the funds should be split amongst the projects based on the votes received

Indexed data can be queried by the graphs deployed from the [graph](../graph) package.

## Directory Structure

```
.
├── prisma
│   ├── schema.prisma                   # Table schema
│   ├── migrations                      # DB migrations
├── src
│   ├── votingStrategies
│       ├── linearQuadraticFunding.ts   # fetching QF votes + compute matching via linear QF
│   ├── utils.ts                        # Helper functions
│   ├── handlers                        # Orchestrator Logic
│   ├── types.ts                        # Types Definition
│   ├── routes.ts                       # Routes
├── index.ts                            # node server configuration
├── Pulumi.dev.yaml                     # Pulumi AWS configuration
├── Pulumi.yaml                         # Pulumi configuration
├── package.json                        # Package configuration
└── README.md
```

### Endpoints

| Description                             | endpoint                                                   | request method | Query Params / Body      |
| --------------------------------------- | ---------------------------------------------------------- | -------------- | ------------------------ |
| Update round summary data               | api/v1/update/summary/round/:chainId/:roundId              | POST           | query: force             |
| Update project summary data             | api/v1/update/summary/project/:chainId/:roundId/:projectId | POST           | query: force             |
| Update round match data                 | api/v1/update/match/round/:chainId/:roundId                | POST           | query: force             |
| Get project match data                  | api/v1/data/match/project/:chainId/:roundId/:projectId     | GET            | query: force             |
| Get round match data                    | api/v1/data/match/round/:chainId/:roundId                  | GET            | query: force             |
| Get project summary data                | api/v1/data/summary/project/:chainId/:roundId/:projectId   | GET            | query: force             |
| Get round summary data                  | api/v1/data/summary/round/:chainId/:roundId                | GET            | query: force             |
| Get multiple project summary data by id | api/v1/data/summary/projects/:chainId/:roundId             | GET            | query: projectIds, force |

### Development

This package consists of

- an express node server
- prisma (ORM) for defining schema and CRUD queries
- posgres DB

#### Running Via Docker

To run this application locally:

1. Generate the `.env` file by cloning `env.sample`

2. Start the docker container to start the posgres DB

```shell
docker compose up
```

The node server will run on `http://localhost:8000/`

Optionally, to generate docs

```shell
npm run prisma:generate # generate docs
npm run prisma:docs     # view generated docs
```

The doc app will run on `http://localhost:5858/`

#### Running Locally

1. Install postgres and have it running

2. Install all dependencies

```
yarn install
```

3. Generate the `.env` file by cloning `env.sample`

4. Set `POSTGRES_HOST` as `localhost` in the env

5. Run node server

```
npm run dev
```

The node server will run on `http://localhost:8000/`

### Making DB changes

Anytime changes the `prisma.schema` file is updated.
Create the migration file for those changes by running

```
yarn prisma:migrate
```
