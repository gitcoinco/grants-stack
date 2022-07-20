## Description

This document outlines the steps needed to upgrade a factory contract.
For this example we will look at Program contracts.

## How does it work ?

```
User ---- tx ---> Proxy ----------> Implementation_v0
                     |
                      ------------> Implementation_v1
                     |
                      ------------> Implementation_v2
```

## How do you interact with the contract and get data back ?

- 1) copy incoming call data
- 2) forward call to logic contract
- 3) retrieve return data
- 4) forward return data back to caller


## Steps

- Update deploy script.

- Ensure V0 factory contract is deployed.
    - Command: `yarn run deploy-program-factory goerli`
    - Proxy Contract: `0x13B2dE16723173389377BE398E1b0EAc3f017a45`
    - Implementation: `0x6f30A726AFE1e5DeBb656fc02456EdE8f8CccCa8`
    - Proxy admin: `0x00E92ec24bF5f6E1b2976a56417e3CaF4509eEF4`


- Deploy V0 impl contract
    - Command: `yarn run deploy-program-implementation goerli`
    - Contract: `0x0a9f8726f276bcB9c8Dcf9d5cDaB896634DE526A`


- Ensure all contracts are verified on etherscan.

- Link V0 Factory to V0 Implementation.
    - Command: `yarn run link-program-implementation goerli`
    - Txn: `0x77a52a1d9d2a6e668df381afde93880d6cfd983b42291715598278d6f1bb331a`

- Create a Program
    - Command: `yarn run create-program goerli`
    - Txn: `0x4fc662f0255336fe08578719070f7f7e1ac583695e4fb5f90be5a43a2d248f39`
    - Contract: `0xe5d96032bf69744b8d629b82a3d9fbe53c8d7f9c`


### Now let's try upgrading both contracts.


- Deploy V1 impl contract.
    - Update `deploy-program-implementation goerli` with the new contract Aritifact
    - Command: `yarn run deploy-program-implementation goerli`
    - Contract: `0x6D22c31ea600E3846B6675a0c0427505Cd2BDF7e`

- Upgrade V1 factory contract.
    - Update config in `upgradeProgramFactory` with new contract name
    - Command: `yarn run upgrade-program-factory goerli`
    - Run etherscan verification on Proxy contract again
    - The upgrade should happen in `Proxy admin` contract

    - Txn: `0x37b4c21f6d4c13a7bc95857ffbc88d488cdebe78805602955f4d951f2dcf715d`
    - Implementation: `0x20C251cE3D26E5Cf628fe9016B07958C4614cC29`

- Link V1 Factory to V1 Implementation.
    - Command: `yarn run link-program-implementation goerli`
    - Txn: `0x9ce9dac457d5cebc46cb832af0f20f9999d6fdd78f97825b0d047bde35a3a187`

- Create a Program
    - Command: `yarn run create-program goerli`
    - Txn: `0x964bc4b61a200505fce8fd4bd95ad6c60c4bd5cfcf058d8ae90047154996e431`
    - Contract:  `0x7b8d5a792f1222994eb80bca68ab478559fc3b58`