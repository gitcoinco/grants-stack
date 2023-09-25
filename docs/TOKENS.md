# Tokens

This is the kb for token-related info in relation to GS/Allo

# DAI in relation to Allo and Grants Stack

## Permit

- DAI has its own permit that is incompatible with EIP2612.
- It doesn't specify allowance, only `allowed: bool` (infinite approval or zero)
- Its version is always 0
- It's currently used on Ethereum and Polygon PoS
- DAI also supports EIP2612 permit on other chains.
- Some have version 1, some have version 2.
- Contracts that don't have a version method (as it's not part of the 2612 spec) are assumed to have version 1
- There's a difference between bridged DAI and Native DAI on some chains.

## Chains

| Chain         | Address                                    | DAI Permit | EIP2612 Permit | Version | transferWithPermit |
|---------------|--------------------------------------------|------------|----------------|---------|--------------------|
| Fantom        | 0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e | ⛔️         | ✅              | 1       | ✅                  |
| Ethereum      | 0x6b175474e89094c44da98b954eedeac495271d0f | ✅          | ⛔️             | 1       | ⛔️                 |
| Polygon PoS   | 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063 | ✅          | ⛔️             | 1       | ⛔️                 |
| Optimism      | 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1 | ⛔️         | ✅              | 2       | ⛔️                 |
| Arbitrum      | 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1 | ⛔️         | ✅              | 2       | ⛔️                 |
| Polygon zkEVM | 0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4 | ⛔️         | ✅              | 1       | ⛔️                 |
| Polygon zkEVM | 0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4 | ⛔️         | ✅              | 1       | ⛔️                 |
| zkSync Era    | No DAI yet                                 |            |                |         |                    |
| Avax          | 0xd586E7F844cEa2F87f50152665BCbc2C279D8d70 | ⛔️         | ⛔              | ⛔       | ⛔️                 |

# USDC Chains

| Chain       | Address                                    | DAI Permit | EIP2612 Permit | Version | transferWithPermit |
|-------------|--------------------------------------------|------------|----------------|---------|--------------------|
| Avax        | 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E | ⛔️         | ✅              | 2       | ⛔️                 |
| Polygon PoS | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 | ⛔️         | ✅              | 1       | ⛔️                 |
