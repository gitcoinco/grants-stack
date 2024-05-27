export const abi = [
  {
    inputs: [],
    name: "AMOUNT_MISMATCH",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyInitialized",
    type: "error",
  },
  {
    inputs: [],
    name: "AmountTooLow",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPool",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "allo",
        type: "address",
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
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "protocol",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "pointer",
            type: "string",
          },
        ],
        indexed: false,
        internalType: "struct Metadata",
        name: "metadata",
        type: "tuple",
      },
    ],
    name: "PoolFunded",
    type: "event",
  },
  {
    inputs: [],
    name: "NATIVE",
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
    inputs: [],
    name: "allo",
    outputs: [
      {
        internalType: "contract IAllo",
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
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "protocol",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "pointer",
            type: "string",
          },
        ],
        internalType: "struct Metadata",
        name: "_metadata",
        type: "tuple",
      },
    ],
    name: "fundPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_allo",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "maxFundings",
    outputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "protocol",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "pointer",
            type: "string",
          },
        ],
        internalType: "struct Metadata",
        name: "metadata",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
