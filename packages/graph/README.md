# graph

This package holds the subgraph which indexs data with regard the 
- ProgramFactory
- ProgramImplementation
- RoundFactory
- RoundImplementation

The subgraph has been on goerli as a hosted service.

**Entity mapping + Playground**
https://api.thegraph.com/subgraphs/name/thelostone-mc/program-factory-v0

**Playground Link**
https://thegraph.com/hosted-service/subgraph/thelostone-mc/program-factory-v0?selected=playground


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
|----------------|
| goerli         |
| optimism-kovan |


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
graph deploy --product hosted-service thelostone-mc/program-factory-v0
```


Note: If you find yourself wanting to run the entire flow in one command.
Use this example where we deploy the subgraph on goerli

```shell
rm -rf generated && rm -rf build &&
    yarn prepare:goerli &&
    graph codegen &&
    graph auth --product hosted-service <YOUR_API_KEY> &&
    graph deploy --product hosted-service thelostone-mc/program-factory-v0
```