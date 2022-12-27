# Upgrades

This document keeps record of all the upgrades done for QFVotingStrategyImplementation


### Version 0.2.0

- change Voted event signature to include bytes32 projectId 
- add new constant to keep track of contract version
- ensure all imports are from contract-upgradable  


| network        | Implementation                             | Prev Implementation                        | Link To Factory Txn                                                |
|----------------|--------------------------------------------|--------------------------------------------|--------------------------------------------------------------------|
| mainnet        |                                            | 0x114885035DAF6f8E09BE55Ed2169d41A512dad45 |                                                                    |
| optimism       |                                            | 0x5987A30F7Cb138c231de96Fe1522Fe4f1e83940D |                                                                    |
| fantom         |                                            | 0x114885035DAF6f8E09BE55Ed2169d41A512dad45 |                                                                    |
| goerli         | 0xcaBE5370293addA85e961bc46fE5ec6D3c6aab28 | 0xfdEAf531f04fd7C6de3938e2069beE83aBadFe08 | 0xa7efaf4e3a1e112b9988b40ecf8d4118d3d85a900cf58cc8cf88f47ad40e92c0 |
| fantom-testnet | 0x1eBBf0FC753e03f13Db456A3686523Fc589E4f67 | 0x4ba9Ed9C90d955FD92687d9aB49deFcCa3C3a959 | 0x009597d84ef86b1794f590e3c9d70df09bdf88cf8efbebcdef5144cced704981 |