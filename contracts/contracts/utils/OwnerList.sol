// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
// A linked list of owners of a project
// The use of a linked list allows us to easily add and remove owners,
// access them directly in O(1), and loop through them.
//
// {
//     count: 3,
//     list: {
//         OWNERS_LIST_SENTINEL => owner1Address,
//         owner1Address => owner2Address,
//         owner2Address => owner3Address,
//         owner3Address => OWNERS_LIST_SENTINEL
//     }
// }
struct OwnerList {
    uint256 count;
    mapping(address => address) list;
}
