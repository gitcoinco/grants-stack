# grants-round/contracts

This project is built using hardhat.
All the contracts required to run / manage a round can be found here.
If you come across any vulnerabilties, do create an issue / raise a PR to help improve the contracts. ^_^

## Directory Structure

```
.
├── contracts                           # Smart contracts
├   ├── utils                           # useful utils
├   ├── program                         # program contracts
├   ├   ├── ProgramFactory.sol          # factory contract which deploys program
├   ├   ├── ProgramImplementation.sol   # program contract
├   ├── GrantRoundFactory.sol           # factory contract which deploys grant round
├   ├── GrantRoundImplementation.sol    # grant round contract 
├   ├── vote                            # voting mechanism
├   ├   ├── IVote.sol                   # voting interface
├   ├   ├── BulkVote.sol                # bulk voting mechanism
├── scripts                             # Deploy scripts for smart contracts
├── docs                                # documentation 
├── test                                # Test for smart contracts
├── .env.example                        # .env template
├── .eslintrc.js                        # Eslint config
├── .prettierrc                         # Prettier config
├── .solhint.json                       # Solhint config
├── hardhat.config.json                 # Hardhat configuration
├── package.json                        # Package configuration
├── tsconfig.json                       # Typescript configuration
└── README.md
```


## Terminology

- **Program**: wallets which together form a team
- **Round Operators**: wallets that have the permission to deploy & manage the round
- **Voter** : wallets who cast a vote to a grant during the grant round 

## General Setup

These steps would have to be done per chain but there are intended to be deployed only once

**Program**
1. Deploy `ProgramFactory`
2. Deploy `ProgramImplementation`
3. Link `ProgramImplementation` to ProgramFactory contract 

**Round**
1. Deploying all voting mechanism (contracts under `votes/`)
2. Deploy `GrantRoundFactory`
3. Deploy `GrantRoundImplementation`
4. Link `GrantRoundImplementation` to `GrantRoundFactory` contract


## Program Setup

1. To create a program, you would not deploy a contract but instead, rely on the create function on the `ProgramFactory` to create a clone of the already deployed `ProgramImplementation` contract
2. Any interaction in terms of updating parameters etc can be performed against the `ProgramImplementation` contract itself


The ProgramFactory enables us to have upgradable contracts on ProgramImplementation


## Round Setup

1. To create a round, you would not deploy a contract but instead, rely on the create function on the `GrantRoundFactory` to create a new `GrantRoundImplementation` contract.
2. The user would have to choose a voting mechanism like `BulkVoting` (already deployed via instruction mention in DEPLOY_STEPS.md)
3. Any interaction in terms of updating parameters etc can be performed against the `GrantRoundImplementation` contract itself


The `GrantRoundFactory` enables us to have upgradable contracts on `GrantRoundImplementation`.


## Deploy Steps

To know how the contracts should be setup, refer [DEPLOY_STEPS.md](https://github.com/gitcoinco/grants-round/blob/main/packages/contracts/docs/DEPLOY_STEPS.md)


## Chain Deployment List

To know the addresses are deployed on which network. refer [CHAINS.md](https://github.com/gitcoinco/grants-round/blob/main/packages/contracts/docs/CHAINS.md)

## Development

To contribute to this project, fork the project and follow the instructions at [DEV.md](https://github.com/gitcoinco/grants-round/blob/main/packages/contracts/docs/DEV.md)