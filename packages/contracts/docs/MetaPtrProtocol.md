# Protocol IDs

## Overview

All the contracts in grants-round has metadata which cannot be stored on-chain and instead store a reference to theier metadata on-chain.
This metadata could contain any information which would is not needed to run a program/round (such as round description / list of approved grants / etc)

The contract stores a reference to this metadata in the following format:

```solidity
struct MetaPtr {
  // Protocol ID corresponding to a specific protocol
  uint256 protocol;
  // Pointer to fetch metadata for the specified protocol
  string pointer;
}
```

This repository contains the mapping from protocol IDs to the actual protocol that integer ID corresponds to.
For example, a protocol value of `1` and a pointer of `QmPMERYmqZtbHmqd2UzRhX9F4cixnMQU2GFa2hYAsQ6J3D` means the metadata for that item can be found on IPFS with a content hash of `QmPMERYmqZtbHmqd2UzRhX9F4cixnMQU2GFa2hYAsQ6J3D`.

## Protocol IDs

Below is the list of currently assigned protocol IDs.
To add a new protocol ID, please submit a pull request that adds an entry to the table with the required information:
- Protocol ID: A nonzero, positive integer between `1` and `2^256 - 1`
- Protocol Name: The name of the protocol, which links to a reference to learn more about the protocol
- Example Pointer(s): A sample `pointer` for this protocol

Note that an ID of zero is intentionally unused to avoid mistaking an unset protocol value for a valid one.


| Protocol ID | Protocol Name            | Example Pointer(s)                               |
| ----------- | ------------------------ | ------------------------------------------------ |
| 0           | -                        | -                                                |
| 1           | [IPFS](https://ipfs.io/) | `QmPMERYmqZtbHmqd2UzRhX9F4cixnMQU2GFa2hYAsQ6J3D` |