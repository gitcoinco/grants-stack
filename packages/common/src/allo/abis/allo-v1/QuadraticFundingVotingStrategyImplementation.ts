export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "grantAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "projectId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "applicationIndex",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "roundAddress",
        type: "address",
      },
    ],
    name: "Voted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "origin",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "grantAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "projectId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "applicationIndex",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "roundAddress",
        type: "address",
      },
    ],
    name: "Voted",
    type: "event",
  },
  {
    inputs: [],
    name: "VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "roundAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "encodedVotes",
        type: "bytes[]",
      },
      {
        internalType: "address",
        name: "voterAddress",
        type: "address",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
