import { Hex } from "viem";

type EASConfig = {
  eas: Hex;
  proxy?: Hex;
  schemaRegistry: Hex;
  version?: string;
};

export interface Signature {
  r: Hex;
  s: Hex;
  v: bigint;
}

export enum ProgressStatus {
  IS_SUCCESS = "IS_SUCCESS",
  SELECTING_COLOR = "SELECTING_COLOR",
  IN_PROGRESS = "IN_PROGRESS",
  NOT_STARTED = "NOT_STARTED",
  IS_ERROR = "IS_ERROR",
  SWITCH_CHAIN = "SWITCH_CHAIN",
}

export interface AttestInput {
  message: {
    schema: Hex;
    recipient: Hex;
    expirationTime: bigint;
    revocable: boolean;
    refUID: Hex;
    data: Hex;
    attester: Hex;
    value?: bigint;
  };
  signature: Signature;
}

type EASConfigByNetwork = Record<number, EASConfig>;

export const easConfig: EASConfigByNetwork = {
  /* ----------- Mainnets ---------- */

  // Mainnet
  1: {
    eas: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
    schemaRegistry: "0xA7b39296258348C78294F95B872b282326A97BDF",

    version: "v0.26",
  },
  // Optimism
  10: {
    eas: "0x4200000000000000000000000000000000000021",
    schemaRegistry: "0x4200000000000000000000000000000000000020",

    version: "v1.0.1",
  },
  // BASE Mainnet
  8453: {
    eas: "0x4200000000000000000000000000000000000021",
    schemaRegistry: "0x4200000000000000000000000000000000000020",

    version: "v1.0.1",
  },
  // Arbitrum One
  42161: {
    eas: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
    // this is the proxy contract
    proxy: "0xeb2AddD987c2C4efF3237Ed6d829c214198c0189",

    schemaRegistry: "0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB",

    version: "v0.26",
  },
  // Polygon Mainnet
  137: {
    eas: "0x5E634ef5355f45A855d02D66eCD687b1502AF790",
    schemaRegistry: "0x7876EEF51A891E737AF8ba5A5E0f0Fd29073D5a7",

    version: "v1.3.0",
  },

  // Scroll
  534352: {
    eas: "0xC47300428b6AD2c7D03BB76D05A176058b47E6B0",
    schemaRegistry: "0xD2CDF46556543316e7D34e8eDc4624e2bB95e3B6",

    version: "v1.3.0",
  },
  // Celo Mainnet
  42220: {
    eas: "0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92",
    schemaRegistry: "0x5ece93bE4BDCF293Ed61FA78698B594F2135AF34",

    version: "v1.3.0",
  },

  // Blast
  81457: {
    eas: "0x4200000000000000000000000000000000000021",
    schemaRegistry: "0x5ece93bE4BDCF293Ed61FA78698B594F2135AF34",
    version: "v1.3.0",
  },

  // Linea
  81458: {
    eas: "0xaEF4103A04090071165F78D45D83A0C0782c2B2a",
    schemaRegistry: "0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797",
    version: "v1.2.0",
  },

  /* ----------- Testnets ---------- */

  // Sepolia
  11155111: {
    eas: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    schemaRegistry: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    version: "v0.26",
  },
  // Optimism Sepolia
  11155420: {
    eas: "0x4200000000000000000000000000000000000021",
    schemaRegistry: "0x4200000000000000000000000000000000000020",
    version: "v1.0.2",
  },
};

export const schemaByNetwork = {
  // 1: "",
  // 10: "",
  42161: "0x5939eb0646e645e2c2f2aa3400421f0fe677e36168188c6dc21405792079b789",
  // 137: "",
  // 534352: "",
  // 42220: "",
  11155111:
    "0xcc6c5d91ac6fbcbfed2100e677a8baf0ee28966a661af106f717ff41d2859ab3",
  // 11155420: "",
};

export const legacyABI = [
  {
    inputs: [
      {
        internalType: "contract ISchemaRegistry",
        name: "registry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessDenied",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyRevoked",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyRevokedOffchain",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyTimestamped",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientValue",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAttestation",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAttestations",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidExpirationTime",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidLength",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidOffset",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRegistry",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRevocation",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRevocations",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSchema",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidShortString",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSignature",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidVerifier",
    type: "error",
  },
  {
    inputs: [],
    name: "Irrevocable",
    type: "error",
  },
  {
    inputs: [],
    name: "NotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPayable",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "str",
        type: "string",
      },
    ],
    name: "StringTooLong",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongSchema",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "attester",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "uid",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "schema",
        type: "bytes32",
      },
    ],
    name: "Attested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "EIP712DomainChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "attester",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "uid",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "schema",
        type: "bytes32",
      },
    ],
    name: "Revoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "revoker",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "data",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "timestamp",
        type: "uint64",
      },
    ],
    name: "RevokedOffchain",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "data",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "timestamp",
        type: "uint64",
      },
    ],
    name: "Timestamped",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                internalType: "uint64",
                name: "expirationTime",
                type: "uint64",
              },
              {
                internalType: "bool",
                name: "revocable",
                type: "bool",
              },
              {
                internalType: "bytes32",
                name: "refUID",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "data",
                type: "bytes",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct AttestationRequestData",
            name: "data",
            type: "tuple",
          },
        ],
        internalType: "struct AttestationRequest",
        name: "request",
        type: "tuple",
      },
    ],
    name: "attest",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                internalType: "uint64",
                name: "expirationTime",
                type: "uint64",
              },
              {
                internalType: "bool",
                name: "revocable",
                type: "bool",
              },
              {
                internalType: "bytes32",
                name: "refUID",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "data",
                type: "bytes",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct AttestationRequestData",
            name: "data",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "v",
                type: "uint8",
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
              },
            ],
            internalType: "struct EIP712Signature",
            name: "signature",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "attester",
            type: "address",
          },
        ],
        internalType: "struct DelegatedAttestationRequest",
        name: "delegatedRequest",
        type: "tuple",
      },
    ],
    name: "attestByDelegation",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      {
        internalType: "bytes1",
        name: "fields",
        type: "bytes1",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "verifyingContract",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256[]",
        name: "extensions",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAttestTypeHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "uid",
        type: "bytes32",
      },
    ],
    name: "getAttestation",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "uid",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            internalType: "uint64",
            name: "time",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "expirationTime",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "revocationTime",
            type: "uint64",
          },
          {
            internalType: "bytes32",
            name: "refUID",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "attester",
            type: "address",
          },
          {
            internalType: "bool",
            name: "revocable",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct Attestation",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDomainSeparator",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getName",
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
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "revoker",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "data",
        type: "bytes32",
      },
    ],
    name: "getRevokeOffchain",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRevokeTypeHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getSchemaRegistry",
    outputs: [
      {
        internalType: "contract ISchemaRegistry",
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
        internalType: "bytes32",
        name: "data",
        type: "bytes32",
      },
    ],
    name: "getTimestamp",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "uid",
        type: "bytes32",
      },
    ],
    name: "isAttestationValid",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                internalType: "uint64",
                name: "expirationTime",
                type: "uint64",
              },
              {
                internalType: "bool",
                name: "revocable",
                type: "bool",
              },
              {
                internalType: "bytes32",
                name: "refUID",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "data",
                type: "bytes",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct AttestationRequestData[]",
            name: "data",
            type: "tuple[]",
          },
        ],
        internalType: "struct MultiAttestationRequest[]",
        name: "multiRequests",
        type: "tuple[]",
      },
    ],
    name: "multiAttest",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                internalType: "uint64",
                name: "expirationTime",
                type: "uint64",
              },
              {
                internalType: "bool",
                name: "revocable",
                type: "bool",
              },
              {
                internalType: "bytes32",
                name: "refUID",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "data",
                type: "bytes",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct AttestationRequestData[]",
            name: "data",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "v",
                type: "uint8",
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
              },
            ],
            internalType: "struct EIP712Signature[]",
            name: "signatures",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "attester",
            type: "address",
          },
        ],
        internalType: "struct MultiDelegatedAttestationRequest[]",
        name: "multiDelegatedRequests",
        type: "tuple[]",
      },
    ],
    name: "multiAttestByDelegation",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "bytes32",
                name: "uid",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct RevocationRequestData[]",
            name: "data",
            type: "tuple[]",
          },
        ],
        internalType: "struct MultiRevocationRequest[]",
        name: "multiRequests",
        type: "tuple[]",
      },
    ],
    name: "multiRevoke",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "bytes32",
                name: "uid",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct RevocationRequestData[]",
            name: "data",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "v",
                type: "uint8",
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
              },
            ],
            internalType: "struct EIP712Signature[]",
            name: "signatures",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "revoker",
            type: "address",
          },
        ],
        internalType: "struct MultiDelegatedRevocationRequest[]",
        name: "multiDelegatedRequests",
        type: "tuple[]",
      },
    ],
    name: "multiRevokeByDelegation",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "data",
        type: "bytes32[]",
      },
    ],
    name: "multiRevokeOffchain",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "data",
        type: "bytes32[]",
      },
    ],
    name: "multiTimestamp",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "bytes32",
                name: "uid",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct RevocationRequestData",
            name: "data",
            type: "tuple",
          },
        ],
        internalType: "struct RevocationRequest",
        name: "request",
        type: "tuple",
      },
    ],
    name: "revoke",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "bytes32",
                name: "uid",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct RevocationRequestData",
            name: "data",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "v",
                type: "uint8",
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
              },
            ],
            internalType: "struct EIP712Signature",
            name: "signature",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "revoker",
            type: "address",
          },
        ],
        internalType: "struct DelegatedRevocationRequest",
        name: "delegatedRequest",
        type: "tuple",
      },
    ],
    name: "revokeByDelegation",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "data",
        type: "bytes32",
      },
    ],
    name: "revokeOffchain",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "data",
        type: "bytes32",
      },
    ],
    name: "timestamp",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
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
] as const;

export const VERSION_ABI = [
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
] as const;

export const proxyABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "schema",
            type: "bytes32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                internalType: "uint64",
                name: "expirationTime",
                type: "uint64",
              },
              {
                internalType: "bool",
                name: "revocable",
                type: "bool",
              },
              {
                internalType: "bytes32",
                name: "refUID",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "data",
                type: "bytes",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct AttestationRequestData",
            name: "data",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "v",
                type: "uint8",
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
              },
            ],
            internalType: "struct Signature",
            name: "signature",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "attester",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "deadline",
            type: "uint64",
          },
        ],
        internalType: "struct DelegatedProxyAttestationRequest",
        name: "delegatedRequest",
        type: "tuple",
      },
    ],
    name: "attestByDelegation",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;
