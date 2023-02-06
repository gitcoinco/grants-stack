# graph

This package holds the subgraph which indexs data with regard the

- ProgramFactory
- ProgramImplementation
- RoundFactory
- RoundImplementation

#### Deployed Subgraphs

The following sections document the hosted services where the subgraph is deployed across different networks

| Network        | GITHUB_USER/SUBGRAPH_NAME             | Playground                                                                                           | Query                                                                                                |
| -------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| mainnet        | gitcoinco/grants-hub-optimism-mainnet | https://thegraph.com/explorer/subgraphs/94TgNF87pKDcuhFkELKQa6o3CcetJvyt3XwkhtsvhrHx?view=Playground | https://gateway.thegraph.com/api/[api-key]/subgraphs/id/94TgNF87pKDcuhFkELKQa6o3CcetJvyt3XwkhtsvhrHx |
| optimism       | gitcoinco/grants-hub-optimism-mainnet | https://thegraph.com/hosted-service/subgraph/gitcoinco/grants-hub-optimism-mainnet                   | https://api.thegraph.com/subgraphs/name/gitcoinco/grants-hub-optimism-mainnet                        |
| goerli         | gitcoinco/grants-hub-goerli-testnet   | https://thegraph.com/hosted-service/subgraph/gitcoinco/grants-hub-goerli-testnet                     | https://api.thegraph.com/subgraphs/name/gitcoinco/grants-hub-goerli-testnet                          |
| fantom         | gitcoinco/grants-hub-fantom-mainnet   | https://thegraph.com/hosted-service/subgraph/gitcoinco/grants-hub-fantom-mainnet                     | https://api.thegraph.com/subgraphs/name/gitcoinco/grants-hub-fantom-mainnet                          |
| fantom-testnet | gitcoinco/grants-hub-fantom-testnet   | https://thegraph.com/hosted-service/subgraph/gitcoinco/grants-hub-fantom-testnet                     | https://api.thegraph.com/subgraphs/name/gitcoinco/grants-hub-fantom-testnet                          |

## Directory Structure

```
.
├── abis                        # human-readable abis of deployed contracts
├── docs                        # useful documentation
├── src
│   ├── projectregistry
│       ├── implementation.ts   # ProjectRegistry event handlers
│   ├── utils.ts                # useful helper functions
├── schema.graphql              # Entity schema
├── subgraph.template.yaml      # Subgraph configuration
├── tsconfig.json               # Typescript configuration
├── package.json                # Package configuration
└── .gitignore
└── README.md
```

## Queries

To know more about the queries which can be run on the playground, check out the [documentation](docs/)

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
| -------------- |
| optimism       |
| goerli         |
| fantom         |
| fantom-testnet |

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
