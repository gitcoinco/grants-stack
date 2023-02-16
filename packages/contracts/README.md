# Allo Contracts

Allo Protocol is a set of smart contracts that enable the democratic allocation
and distribution of funds through the power of [Quadratic
Funding](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3243656). It is the
former smart contract back-end for cGrants, Gitcoin's public goods funding
product. This new iteration is more flexible and more modular. It powers
Gitcoin's three products,
[Builder](https://github.com/gitcoinco/grants-round/tree/main/packages/builder),
[Explorer](https://github.com/gitcoinco/grants-round/tree/main/packages/grant-explorer),
and
[Manager](https://github.com/gitcoinco/grants-round/tree/main/packages/round-manager),
and empowers anyone to build on top of a permissionless ecosystem of grants.

Read more about the [release of this
protocol](https://go.gitcoin.co/blog/introduction-to-grants-protocol) and [the
latest Alpha
test](https://go.gitcoin.co/blog/announcing-the-gitcoin-alpha-tests).

For the latest documentation, please visit
[docs.alloprotocol.com](docs.alloprotocol.com)

## Useful Links

The following links will be helpful to you in working with Allo, whether you are
contributing to the protocol or building on top of it.

- [Official Documentation]()
- [Quick Start Guide]()

### Updates

- [Official Website]()
- [Twitter]()
- [Mailing List]()

### Getting Involved

To get involved, visit the [Contributing](#contribute) section below. Also, join
our [Discord](https://discord.gg/gitcoin) and head to the #grants-round channel.

## System Architecture

<!-- Provide an architectural diagram of the protocol that someone can use to get
familiar with the system -->

### Directory Structure

```
.
├── contracts                           # Smart contracts
├   ├── utils                           # useful utils
├   ├── program                         # program contracts
├   ├   ├── ProgramFactory.sol          # factory contract which deploys program
├   ├   ├── ProgramImplementation.sol   # program contract
├   ├── round                           # round contracts
├   ├   ├── RoundFactory.sol            # factory contract which deploys round
├   ├   ├── RoundImplementation.sol     # round contract 
├   ├── votingStrategy                  # voting strategy
├   ├   ├── IVotingStrategy.sol         # voting strategy interface
├   ├   ├── QuadraticFundingVotingStrategy.sol      # QF voting strategy
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

## Contribute

We welcome everyone to contribute to Allo. Please review the [contribution
guidelines](./CONTRIBUTING.md) before proceeding.

You can join our [Discord](https://discord.gg/gitcoin) to get help and discuss
the project with the rest of the community.

You can also familiarize yourself with our near term project roadmap in the
[project backlog](https://github.com/orgs/gitcoinco/projects/7).

## Deploy Steps

To know how the contracts should be setup, refer
[DEPLOY_STEPS.md](docs/DEPLOY_STEPS.md).

## Chain Deployment List

To know the addresses are deployed on which network, refer to
[CHAINS.md](docs/CHAINS.md).

## Development

To contribute to this project, fork the project and follow the instructions at
[DEV.md](docs/DEV.md).

## Contract Documentation

The contract documentation has been generated using
[primitive-dodoc](https://github.com/primitivefinance/primitive-dodoc) and can
be found over at [docs/contracts](docs/contracts/).

## [License](../../LICENSE)

All code is licensed under GNU AGPL.

