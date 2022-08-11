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
| goerli         | thelostone-mc/program-factory-v0             | https://thegraph.com/hosted-service/subgraph/thelostone-mc/program-factory-v0             | https://api.thegraph.com/subgraphs/name/thelostone-mc/program-factory-v0              |
| optimism-kovan | thelostone-mc/grants-round-optimism-kovan    | https://thegraph.com/hosted-service/subgraph/thelostone-mc/grants-round-optimism-kovan    | https://api.thegraph.com/subgraphs/name/thelostone-mc/grants-round-optimism-kovan     |
| optimism       | thelostone-mc/grants-round-optimism-mainnet  | https://thegraph.com/hosted-service/subgraph/thelostone-mc/grants-round-optimism-mainnet  | https://api.thegraph.com/subgraphs/name/thelostone-mc/grants-round-optimism-mainnet   |

## Directory Structure

```
.
├── abis                        # human-readable abis of deployed contracts
├── docs                        # useful documentation
├── src
│   ├── program
│       ├── factory.ts          # ProgramFactory event handlers
│       ├── implementation.ts   # ProgramImplementation event handlers
│   ├── round
│       ├── factory.ts          # RoundFactory event handlers
│       ├── implementation.ts   # RoundImplementation event handlers
│   ├── utils.ts                # useful helper functions
├── schema.graphql              # Entity schema
├── config                      # Chain + contract configuration
├── subgraph.template.yaml      # Subgraph configuration
├── tsconfig.json               # Typescript configuration
├── package.json                # Package configuration
└── .gitignore
└── README.md
```

## Queries

To know more about the queries which can be run on the playground, check out the documentation for
- [Program](/docs/Program.md)
- [Round](/docs/Round.md)

To know the relationship between the different entities and the type of queries. Refer [schema.graphql](./schema.graphql)


## Deploy Subgraph
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
| goerli         |
| optimism-kovan |
| optimism       |


- Run codegen
```shell
graph codegen
```

- Authenticate hosted service
```shell
graph auth --product hosted-service <YOUR_API_KEY>
```

- Deploy Subgraph
```shell
graph deploy --product hosted-service <GITHUB_USER>/<SUBGRAPH_NAME>
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