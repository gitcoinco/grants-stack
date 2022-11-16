# Grants Hub

Grants Hub is the all in one destination for project owners to build and fund their projects, and bring their vision to life.

## Our Vision

We envision owners using Grants Hub as a place they incept their project’s existence
and then use it as a vehicle for growth over time.
As an open source, permissionless protocol, it will provide critical infrastructure to other projects
that support and enable project growth over time.
It will be the web3 space for creating a connected home for your project that allows you to build a reputation for sustainable
fundraising, recruiting talent, reporting progress over time, and promoting your expertise.


## ProjectRegistry

The ProjectRegistry is a smart contract that allows people to manage projects and their owners.

Each ProjectRegistry contract is deployed as an upgradeable contract following the openzeppelin `TransparentUpgradeableProxy` pattern.

Each projects has a pointer to its metadata file with all the project attributes. All metadata files are stored
in a decentralized storage like IPFS. The metadata pointer documentation can be found in the [Metadata Pointers](./contracts/docs/MetadataPointers.md) document.

Any EVM compatible chain can have its own ProjectRegistry.

We currently deployed our ProjectRegistry contract to the chains specified below.

## Chains

### Goerli

| Contract                          | Address                                    |
|-----------------------------------|--------------------------------------------|
| ProjectRegistry (Proxy)           | 0x832c5391dc7931312CbdBc1046669c9c3A4A28d5 |
| ProjectRegistry Implementation    | 0x85CB556ED339aa7f5B46D704B2fF5F5c1FFBEb49 |
| Proxy Admin                       | 0x2dB4d492301E42Ad746eEA2B63E67B0132796493 |

### Optimism

| Contract                          | Address                                    |
|-----------------------------------|--------------------------------------------|
| ProjectRegistry (Proxy)           | 0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174 |
| ProjectRegistry Implementation    | 0xbce556cf365E631fF50449211A6f2CB8936f40D1 |
| Proxy Admin                       | 0xec77FccE4f0396BaB43BC66a513157Ee59EE07c7 |

### Fantom testnet

| Contract                          | Address                                    |
|-----------------------------------|--------------------------------------------|
| ProjectRegistry (Proxy)           | 0xCA73C80BA8E64161EA79583c43eBF9A6424D9c19 |
| ProjectRegistry Implementation    | 0x5C5ebf52f2eAC42d1640714abed069F9E573D805 |
| Proxy Admin                       | 0x4fE3Ce42BB2373C8fD2f59A59EdC397656EE142e |

### Fantom mainnet

| Contract                          | Address                                    |
|-----------------------------------|--------------------------------------------|
| ProjectRegistry (Proxy)           | 0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174 |
| ProjectRegistry Implementation    | 0xbce556cf365E631fF50449211A6f2CB8936f40D1 |
| Proxy Admin                       | 0xec77FccE4f0396BaB43BC66a513157Ee59EE07c7 |

## Subgraph

Each chain has its own subgraph that caches all the projects with their owners and
the pointer to their metadata.

More info in the [subgraph folder](./graph/README.md).

## Contracts

The [contracts folder](./contracts) contains the hardhat project with the contracts and their documentation.

## Client dApp

The [client folder](./client) contains the client dApp that allows users to
interact with their projects and to apply to grant rounds.
