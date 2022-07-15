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
├── subgraph.yaml               # Subgraph configuration
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