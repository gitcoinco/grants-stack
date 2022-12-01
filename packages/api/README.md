# api

This package is pulumi configured app which offers API / endpoints to:

- calculate the matching distribution for a given round based on the voting strategy
- store the results of a calculations
- return the latest distribution of funds within the round
- return a specifc project's matching amount within a round

This package is meant to be used by the round operators to
- view how the matching funds distributions evolve during the course of a round
- determine how the funds should be split amongst the projects based on the votes recieved

Indexed data can be queried by the graphs deployed from the [graph](../graph) package.

## Directory Structure

```
.
├── src
│   ├── votingStrategies
│       ├── linearQuadraticFunding.ts   # fetching QF votes + compute matching via linear QF
│   ├── utils.ts                        # Helper functions
│   ├── index.ts                        # Orchestrator Logic
├── index.ts                            # Routes
├── Pulumi.dev.yaml                     # Pulumi AWS configuration
├── Pulumi.yaml                         # Pulumi configuration
├── package.json                        # Package configuration
└── README.md
```


### Endpoints

| endpoint            | request method | body                                                                                | params                              |
|---------------------|----------------|-------------------------------------------------------------------------------------|-------------------------------------|
| /calculate          | POST           | {   "chainId" : "3",     "roundId" : "0xcef1772dd6764c95f14c26b25e8f012c072c5f77" } |                  -                  |
| /fetchRoundMatching | GET            |                                   -                                                 | roundId: string, projectId?: string |
|                     |                |                                                                                     |                                     |



### Development

This package consists of

- an express node server
- prisma (ORM) for defining schema and CRUD queries
- posgres DB

To run this application locally:

1. Start the docker container to start the posgres DB
```shell
docker compose up
```

2. On a seperate terminal, start the node server
```shell
npm run dev
```

3. Run the migrations to create tables
```shell
npm run prisma:migrate
```

The node server will run on `http://localhost:8000/`


Optionally, to generate docs
```shell
npm run prisma:generate # generate docs
npm run prisma:docs     # view generated docs
```

The doc app will run on `http://localhost:5858/`