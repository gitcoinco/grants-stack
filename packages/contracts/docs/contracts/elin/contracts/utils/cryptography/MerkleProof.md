# MerkleProof







*These functions deal with verification of Merkle Tree proofs. The tree and the proofs can be generated using our https://github.com/OpenZeppelin/merkle-tree[JavaScript library]. You will find a quickstart guide in the readme. WARNING: You should avoid using leaf values that are 64 bytes long prior to hashing, or use a hash function other than keccak256 for hashing leaves. This is because the concatenation of a sorted pair of internal nodes in the merkle tree could be reinterpreted as a leaf value. OpenZeppelin&#39;s JavaScript library generates merkle trees that are safe against this attack out of the box.*



