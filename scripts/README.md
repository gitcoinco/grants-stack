## Summary

Adds a full local development environment setup allowing local testing with all the services running on `docker-compose` and scripts to populate the environment with test data.

With docker compose we run:

* `piña`: a local dev only IPFS implementation with the Pinata API endpoint to pin files (https://github.com/gitcoinco/pina).
* 2 anvil instances running local chains with id `313371` and `313372`
* 1 postgres database used by the indexer
* an instance of our Indexer indexing the 2 local chains

The `scripts/dev` script contains commands to:

* deploy Allo V1 contracts to the 2 local chains
* populate the 2 chains with Allo V1 projects
* deploy Allo V2 contracts to the 2 local chains
* populate the 2 chains with Allo V2 profiles

## Commands

* `./scripts/dev up`: starts all the services with `docker-compose` in detached mode and follow logs.
* `./scripts/dev down`: stops the services.
* `./scripts/dev setup`: calls the subcommands to deploy and populate Allo V1 and V2 in the 2 local chains.
* `./scripts/dev start`: starts all the 3 apps and watch common and data-layer for changes.

## Additional work

* Dockerized allo-v1 scripts to deploy and populate Allo V1 https://github.com/gitcoinco/grants-stack-allo-contracts-v1
* Dockerized allo-v2 scripts to deploy and populate Allo V2 https://github.com/gitcoinco/grants-stack-allo-contracts-v2
* Custom dev-only ipfs server with the same Pinata APIs we use https://github.com/gitcoinco/pina
* Indexer with local chains support and with a temporary fix to make it work locally https://github.com/gravityblast/grants-stack-indexer

## Allo V1

| Contract | Address |
| --- | --- |
| ProjectRegistry | 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 |
| ProgramFactory | 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 |
| ProgramImplementation | 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 |
| QuadraticFundingVotingStrategyFactory | 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6 |
| QuadraticFundingVotingStrategyImplementation | 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 |
| MerklePayoutStrategyFactory | 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0 |
| MerklePayoutStrategyImplementation | 0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82 |
| DirectPayoutStrategyFactory | 0x0B306BF915C4d645ff596e518fAf3F9669b97016 |
| DirectPayoutStrategyImplementation | 0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1 |
| AlloSettings | 0x3Aa5ebB10DC797CAC828524e59A333d0A371443c |
| RoundFactory | 0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f |
| RoundImplementation | 0x4A679253410272dd5232B3Ff7cF5dbB88f295319 |


