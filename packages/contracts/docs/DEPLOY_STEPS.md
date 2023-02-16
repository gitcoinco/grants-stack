# Deployment Guide

This guide will walk you through deploying the protocol's smart contracts to
a new network. Note that these contracts are intended to only be deployed once
per chain.

## Overview

These steps have to be done per chain and are intended to be deployed only once
per chain.

**1. Program** - First we deploy and set up the Program contracts.

1. Deploy `ProgramFactory`
2. Deploy `ProgramImplementation`
3. Link `ProgramImplementation` to `ProgramFactory` contract 

To create an individual Program, use the `ProgramFactory`. Do not deploy a new
instance of the `ProgramImplementation` contract.

**2. Round** - Then we deploy and set up the Round contracts.

1. Deploying all voting strategy (contracts under `votingStrategy/`)
2. Deploy `RoundFactory`
3. Deploy `RoundImplementation`
4. Link `RoundImplementation` to `RoundFactory` contract

To create an individual Round, use the `RoundFactory` rather than deploying your
own instance of `RoundImplementation`.

**3. Project Registry** - Finally, we deploy the Project Registry contracts.

1. Deploy the `ProgramRegistry` contract

The `ProgramFactory` enables us to have upgradable contracts on `ProgramImplementation`

## Networks

The project has been configured to support the following networks. All the
deploy scripts expect a network parameter to know which network to deploy to.

| Network            |
|--------------------|
| `goerli`           |
| `optimism-mainnet` |
| 'fantom-mainnet'   |
| `fantom-testnet`   |
| `mainnet`          |

### Project Registry

The section here shows how to set up the project registry for the first time on
a given network. Ideally these steps would be done once per chain. In this
example, we would be deploying on Goerli

0. Create an `.env` file
```sh
cp ../.env.example ../.env
```

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification

2. Deploy the `ProgramRegistry` contract
```shell
pnpm run deploy-builder goerli
```


### Program Setup

The section here shows how to set up the program for the first time on a given
network. Ideally these steps would be done once per chain. In this example , we
would be deploying on goerli

0. Create an `.env` file
```sh
cp ../.env.example ../.env
```

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification

2. Deploy the `ProgramFactory` contract
```shell
pnpm run deploy-program-factory goerli
```

3. Deploy the `ProgramImplementation` contract
```shell
pnpm run deploy-program-implementation goerli
```

4. Update `program.config.ts` with deployed contracts based on your network
```javascript
export const params: DeployParams = {
  goerli: {
    programImplementationContract: 'DEPLOYED_PROGRAM_IMPLEMENTATION_CONTRACT',
    programFactoryContract: 'DEPLOYED_PROGRAM_FACTORY_CONTRACT',
    ...
  },
};
```

5. Update `ProgramFactory` to reference the `ProgramImplementation` contract.
```shell
pnpm run link-program-implementation goerli
```


### VotingStrategy Setup

The section here shows how to set up voting strategy for the first time on
a given network. Ideally these steps would be done once per chain. In this
example ,we would be deploying the QuadraticFundingVotingStrategyImplementation
contract on goerli

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification


2. Deploy the `QuadraticFundingVotingStrategyFactory` contract
```shell
pnpm run deploy-qf-factory goerli
```

3. Deploy the `QuadraticFundingVotingStrategyImplementation` contract
```shell
pnpm run deploy-qf-implementation goerli
```

4. Update `votingStrategy.config.ts` with deployed contracts based on your network
```javascript
export const QFVotingParams: DeployParams = {
  "goerli": {
    factory: 'DEPLOYED_QF_FACTORY_CONTRACT',
    implementation: 'DEPLOYED_QF_IMPLEMENTATION_CONTRACT',
    ...
  },
  ...
};
```

5. Update `QuadraticFundingVotingStrategyFactory` to reference the `QuadraticFundingVotingStrategyImplementation` contract
```shell
pnpm run link-qf-implementation goerli
```

### PayoutStrategy Setup

The section here shows how to deploy the payout strategy contract. Ideally these
would be done before creating a round. In this example ,we would be deploying
the MerklePayoutStrategy contract on goerli. This would have to be done before
creating a round so that round is aware and store a reference to the voting
contract during it's creation.


1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification


2. Deploy the `MerklePayoutStrategyFactory` contract
```shell
pnpm run deploy-merkle-contract goerli
```

3. Update `payoutStrategy.config.ts` with deployed contract based on your network
```javascript
export const PayoutParams: DeployParams = {
  "goerli": {
    merklePayoutContract: 'DEPLOYED_MERKLE_CONTRACT',
    ...
  },
  ...
};
```


### Round Setup

The section here shows how to set up the round manager for the first time on
a given network. Ideally these steps would be done once per chain. In this
example , we would be deploying on goerli

1. Create an `.env` file and fill out
    - `INFURA_ID`                     : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`          : address which deploys the contract
    - `ETHERSCAN_API_KEY`             : API key for etherscan verification on mainnet / testnet
    - `OPTIMISTIC_ETHERSCAN_API_KEY`  : API key for etherscan verification on optimism mainnet / testnet


2. Deploy the `RoundFactory` contract
```shell
pnpm run deploy-round-factory goerli
```

3. Deploy the `RoundImplementation` contract
```shell
pnpm run deploy-round-implementation goerli
```

4. Update `round.config.ts` with deployed contracts based on your network
```javascript
export const params: DeployParams = {
  goerli: {
    roundImplementationContract: 'DEPLOYED_ROUND_IMPLEMENTATION_CONTRACT',
    roundFactoryContract: 'DEPLOYED_ROUND_FACTORY_CONTRACT',
    ...
  },
  ...
};
```

5. Update `RoundFactory` to reference the `RoundImplementation` contract
```shell
pnpm run link-round-implementation goerli
```

### Payout Setup
<!-- TODO -->


### Contract Verification on etherscan

```
pnpm hardhat clean
pnpm hardhat verify --network goerli <CONTRACT_ADDRESS>
```

##### Helper Deploy Script

```shell

# Program
pnpm run deploy-program-factory goerli
pnpm run deploy-program-implementation goerli
pnpm run link-program-implementation goerli

# QF
pnpm run deploy-qf-factory goerli
pnpm run deploy-qf-implementation goerli
pnpm run link-qf-implementation goerli

# Payout
pnpm run deploy-merkle-contract goerli

# Round
pnpm run deploy-round-factory goerli
pnpm run deploy-round-implementation goerli
pnpm run link-round-implementation goerli
pnpm run create-round goerli

# Project Registry
pnpm run deploy-builder goerli

# These scripts would be used to create a test round
pnpm run create-program goerli
pnpm run create-qf-contract goerli
pnpm run deploy-merkle-contract goerli
pnpm run create-round goerli
```
