# Setup

## Terminology

- **Program Operators**: wallets that have the permission to create & manage the program
- **Program**: maintained by Program Operators which together form a team
- **Round Operators**: wallets that have the permission to create & manage the round
- **Round**: created by a Program and deal with everything relating to running a round
- **Voter** : wallet who cast a vote to a grant during the round

## General Setup

These steps would have to be done per chain but there are intended to be deployed only once

**Program**
1. Deploy `ProgramFactory`
2. Deploy `ProgramImplementation`
3. Link `ProgramImplementation` to ProgramFactory contract 

**Round**
1. Deploying all voting strategy (contracts under `votingStrategy/`)
2. Deploy `RoundFactory`
3. Deploy `RoundImplementation`
4. Link `RoundImplementation` to `RoundFactory` contract


## Program Setup

1. To create a program, you would not deploy a contract but instead, rely on the create function on the `ProgramFactory` to create a clone of the already deployed `ProgramImplementation` contract
2. Any interaction in terms of updating parameters etc can be performed against the `ProgramImplementation` contract itself


The ProgramFactory enables us to have upgradable contracts on ProgramImplementation


## Round Setup

1. To create a round, you would not deploy a contract but instead, rely on the create function on the `RoundFactory` to create a new `RoundImplementation` contract.
2. The user would have to choose a voting strategy like `QuadraticFundingVotingStrategy` (already deployed via instruction mention in DEPLOY_STEPS.md)
3. Any interaction in terms of updating parameters etc can be performed against the `RoundImplementation` contract itself


The `RoundFactory` enables us to have upgradable contracts on `RoundImplementation`.


## Deploy Steps

To know how the contracts should be setup, refer [DEPLOY_STEPS.md](docs/DEPLOY_STEPS.md)


## Chain Deployment List

To know the addresses are deployed on which network. refer [CHAINS.md](docs/CHAINS.md)

## Development

To contribute to this project, fork the project and follow the instructions at [DEV.md](docs/DEV.md)

## Contract Documentation

The contract documentation has been generated using [primitive-dodoc](https://github.com/primitivefinance/primitive-dodoc) and can be found over at [docs/contracts](docs/contracts/)

