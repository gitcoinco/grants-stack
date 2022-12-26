# Upgrades

This document keeps record of all the upgrades done for QFVotingStrategyImplementation


### Version 0.2.0

Note: The older QFVotingStrategyImplementation was not deployed as a Proxy and hence we couldn't upgrade that contract.
We've now redeployed a fresh QFVotingStrategyImplementation contract and updated the RoundFactory to link to this contract
Going forward all upgrades to QFVotingStrategyImplementation will involve doing a simple upgrade proxy (AKA no address change during upgrade)

- add projectId to Voted event
- add new variable for contract version


| network        | Implementation                             | Prev Implementation | Txn                                                                |
|----------------|--------------------------------------------|---------------------|--------------------------------------------------------------------|
| goerli         | 0x19a00b35f3aca4d06eab38f588d2e42a14128b52 |          -          | 0xf29a72c2d703c0360b212805db51f494f900821393d77f6c3b31bf38d79f4c26 |
| mainnet        |                                            |                     |                                                                    |
| fantom         |                                            |                     |                                                                    |
| fantom-testnet | 0xd0f50f0c0228760fdbc9cc66564d5a9f06830c9a |          -          | 0x7064339c4cf5660a73b06eede93cd385ac88e98b2656aa88666dd8000ae39005 |
| optimism       |                                            |                     |                                                                    |