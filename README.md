# Grant Hub

The Grant Hub will feed a universal grant registry, from which round managers can source grants for their rounds.

This repo contains the smart contracts and UI which will be used to publish and manage a user's project/s

## Contributing to the Grant Hub

We welcome everyone to contribute to the Grant Hub.

You can join our [Discord](https://discord.gg/w6K2wwHr) (just be sure to select the builder role when you join the discord) to get help and discuss the project with the rest of the community.

You can also familiarize yourself with our near term project roadmap in the Grant Hub  [project backlog](https://github.com/orgs/gitcoinco/projects/7/views/3)

## Reviewing Changes

Once a pull request is sent, the Grant Hub team will review your changes. We outline our process below to clarify the roles of everyone involved.

All pull requests must be approved by two committers before being merged into the repository. If any changes are necessary, the team will leave appropriate comments requesting changes to the code. Unfortunately, we cannot guarantee a pull request will be merged, even when modifications are requested, as the Grant Hub team will re-evaluate the contribution as it changes.

Committers may also push style changes directly to your branch. If you would rather manage all changes yourself, you can disable the "Allow edits from maintainers" feature when submitting your pull request.

The Grant Hub team may optionally assign someone to review a pull request. If someone is assigned, they must explicitly approve the code before another team member can merge it.

When the review finishes, your pull request will be squashed and merged into the repository. If you have carefully organized your commits and believe they should be merged without squashing, please mention it in a comment.

## For network forking

In `client` dir, add the following to your `.env` file:

```
REACT_APP_LOCALCHAIN=true
```

In `contracts` dir, uncomment the `GOERLI_URL` variable and replace `$ALCHEMY_KEY` with your Goerli alchemy key

Start a local fork with:

```
cd contracts && yarn fork [--fork-block-number YOUR_BLOCK_NUMBER]
```

> NB: Your chainID for accessing rounds locally will become `31337` instead of `5`

## Directory Structure

```
.
├── client
│   ├── public
│   └── src
│       ├── actions
│       ├── components
│       │   ├── base
│       │   └── grants
│       ├── contracts
│       │   └── abis
│       ├── reducers
│       ├── styles
│       └── types
└── contracts
    ├── artifacts
    │   ├── build-info
    │   ├── contracts
    │   │   └── ProjectRegistry.sol
    │   └── hardhat
    │       └── console.sol
    ├── contracts
    ├── lib
    ├── scripts
    │   └── migrations
    ├── test
    └── typechain
        └── factories
```
