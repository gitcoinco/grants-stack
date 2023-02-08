# Allo Contracts

Allo Protocol is a set of smart contracts that enable the democratic allocation
and distribution of funds through the power of [Quadratic
Funding](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3243656). It is the
former smart contract back-end for cGrants, Gitcoin's quadratic funding grant
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

<!-- Welcome message, encouraging contribution -->
We welcome everyone to contribute to Allo. Please review the [contribution
guidelines]() before proceeding.

You can join our [Discord](https://discord.gg/gitcoin) to get help and discuss
the project with the rest of the community.

You can also familiarize yourself with our near term project roadmap in the
[project backlog](https://github.com/orgs/gitcoinco/projects/7).

### Setup

<!-- Summary and link to the Setup instructions -->
Instructions are provided in the [`SETUP.md`](./SETUP.md) for getting the
codebase up and running on your local machine.

### Submit a Bug Report

<!-- Instructions on how to submit a bug report. GH Issue for bugs, bug bounty
program for security vulnerabilties. -->

For non-security-critical bugs, you can open a [public
issue](https://github.com/gitcoinco/grants-round/issues/new?assignees=&labels=bug&template=bug.md&title=)
on this repository, but please follow our issue guidelines for doing so.

### Submit a Feature Request

<!-- How to submit a feature request -->
To request a feature be added to the protocol, please open a [public issue](https://github.com/gitcoinco/grants-round/issues/new?assignees=&labels=&template=feature_request.md&title=), but please follow our issue guidelines for doing so.

## [License](../../LICENSE)

All code is licensed under GNU AGPL.
<!-- Link to the license -->
