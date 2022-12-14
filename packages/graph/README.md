# graph

This package holds the subgraph which indexs data with regard the
- ProgramFactory
- ProgramImplementation
- RoundFactory
- RoundImplementation


#### Deployed Subgraphs

The following sections document the hosted services where the subgraph is deployed across different networks

| Network        | GITHUB_USER/SUBGRAPH_NAME                    | Playground                                                                                | Query                                                                                 |
|----------------|----------------------------------------------|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| mainnet        | grants-round-mainnet                         | https://thegraph.com/explorer/subgraphs/BQXTJRLZi7NWGq5AXzQQxvYNa5i1HmqALEJwy3gGJHCr?view=Playground  | https://gateway.thegraph.com/api/[api-key]/subgraphs/id/BQXTJRLZi7NWGq5AXzQQxvYNa5i1HmqALEJwy3gGJHCr                 |
| goerli         | gitcoinco/grants-round-goerli-testnet        | https://thegraph.com/hosted-service/subgraph/gitcoinco/grants-round-goerli-testnet        | https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-goerli-testnet         |
| fantom         | gitcoinco/grants-round-fantom-mainnet        | https://thegraph.com/hosted-service/subgraph/gitcoinco/grants-round-fantom-mainnet        | https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-mainnet         |
| fantom-testnet | gitcoinco/grants-round-fantom-testnet        | https://thegraph.com/hosted-service/subgraph/gitcoinco/grants-round-fantom-testnet        | https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-testnet         |
| optimism       | gitcoinco/grants-round-optimism-mainnet      | https://thegraph.com/hosted-service/subgraph/gitcoinco/grants-round-optimism-mainnet      | https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet       |

## Directory Structure

```
.
├── abis                            # human-readable abis of deployed contracts
├── docs                            # useful documentation
├── src
│   ├── program
│       ├── factory.ts              # ProgramFactory event handlers
│       ├── implementation.ts       # ProgramImplementation event handlers
│   ├── round
│       ├── factory.ts              # RoundFactory event handlers
│       ├── implementation.ts       # RoundImplementation event handlers
│   ├── votingStrategy
│       ├── QuadraticFunding
│           ├── factory.ts          # QFFactory event handlers
│           ├── implementation.ts   # QFImplementation event handlers
│   ├── utils.ts                    # useful helper functions
├── schema.graphql                  # Entity schema
├── config                          # Chain + contract configuration
├── subgraph.template.yaml          # Subgraph configuration
├── tsconfig.json                   # Typescript configuration
├── package.json                    # Package configuration
└── .gitignore
└── README.md
```

## Queries

To know more about the queries which can be run on the playground, check out the documentation for
- [Program](/packages/graph/docs/Program.md)
- [Round](/packages/graph/docs/Round.md)
- [QFVotingStrategy](/packages/graph/docs/QFVotingStrategy.md)

To know the relationship between the different entities and the type of queries. Refer [schema.graphql](./schema.graphql)


## Deploy subgraph locally

The `docker-compose.yml` contains everything you need to run your own local graph-node, including a hardhat node.

1. Install Docker with Docker Compose
2. `docker compose up` - start all the services
3. `yarn deploy-local` -  deploy your subgraph to your local graph-node instance
3. Deploy your contracts as described in `contracts/docs/DEPLOY_STEPS.md`
4. Interact with the contracts to create some data
5. Interact with the subgraph on localhost as outlined in the `graph-node` container logs


## Deploy Subgraph on a hosted service
Generate your hosted-service API key on the graph

- Remove redundant files
```shell
rm -rf generated && rm -rf build
```

- Generate the `subgraph.yaml` for the network against which you'd like to deploy the subgraph

```shell
yarn prepare:<NETWORK_TO_DEPLOY_SUBGRAPH>
```

**Supported Networks**

| network        |
|----------------|
| mainnet        |   
| goerli         |
| optimism       |
| fantom         |
| fantom-testnet |
| localhost      |


- Run codegen
```shell
graph codegen
```

- Authenticate - incase of hosted service
```shell
graph auth --product hosted-service <YOUR_API_KEY>
```

- Authenticate - incase of studio
```shell
graph auth --studio <YOUR_API_KEY>
```

- Deploy Subgraph - incase of hosted service
```shell
graph deploy --product hosted-service <GITHUB_USER>/<SUBGRAPH_NAME>
```

- Deploy Subgraph - incase of studio
```shell
graph deploy --studio <SUBGRAPH_NAME>
```

Note: If you find yourself wanting to run the entire flow in one command.
Use this example where we deploy the subgraph on goerli

```shell
rm -rf generated && rm -rf build &&
    yarn prepare:goerli &&
    graph codegen &&
    graph auth --product hosted-service <YOUR_API_KEY> &&
    graph deploy --product hosted-service <GITHUB_USER>/<SUBGRAPH_NAME>
```


## How do we fetch off-chain storage

The subgraph fetches the `metaPtr` from the contracts and index them making it easy to fetch additional information from of a given entity. To know more on what is the structure of a `metaPtr` and how you can retrieve information refer [MetaPtrProtocol](../contracts/docs/MetaPtrProtocol.md)


## Deploying subgraph to a new network

1. Ensure all the contracts are deployed on network
2. Create config file within `config/<network-name>.json` and wire in the contract addresses
3. Add new script in `package.json` to generate subgraph `prepare:<network-name>`
3. Generate the `subgraph.yaml` file using `yarn prepare:<network-name>`
4. Run `graph codegen`
5. Deploy the subgraph
