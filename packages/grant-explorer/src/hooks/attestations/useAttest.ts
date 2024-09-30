// hooks/useAtest.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { EAS__factory } from "@ethereum-attestation-service/eas-contracts";

export interface Signature {
  r: `0x${string}`;
  s: `0x${string}`;
  v: bigint;
}

/**
 * Custom hook to attest data to the EAS contract.
 *
 * @param {string} easAddress - The address of the EAS contract.
 */
export const useAttest = (easAddress: string) => {
  const { chainId, address } = useAccount();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // TODO: Update the ABI to match the actual ABI of the EAS contract
  // Use the abi by checking legacy contract version like in here https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/legacy/version.ts

  const abi = EAS__factory.abi;

  return useMutation({
    mutationFn: async (data: {
      message: {
        schema: `0x${string}`;
        recipient: `0x${string}`;
        expirationTime: bigint;
        revocable: boolean;
        refUID: `0x${string}`;
        data: `0x${string}`;
        attester: `0x${string}`;
      };
      signature: Signature;
    }): Promise<string> => {
      try {
        if (
          !chainId ||
          !address ||
          !walletClient ||
          !easAddress ||
          !data ||
          !publicClient
        ) {
          throw new Error("Data missing for attestation");
        }

        console.log("Attesting data:", data);

        const args = {
          schema:
            "0xcc6c5d91ac6fbcbfed2100e677a8baf0ee28966a661af106f717ff41d2859ab3",
          data: {
            recipient: data.message.recipient,
            expirationTime: BigInt(0),
            revocable: data.message.revocable,
            refUID: data.message.refUID,
            data: data.message.data,
            value: BigInt(0),
          },
          signature: {
            v: data.signature.v,
            r: data.signature.r,
            s: data.signature.s,
          },
          deadline: BigInt("0"),
          attester: getAddress(data.message.attester),
        };

        console.log("Attesting args:", args);

        const contractCallArgs = {
          address: getAddress(easAddress),
          abi: abi2,
          functionName: "attestByDelegation",
          args: [args],
          value: BigInt(0),
        } as EstimateContractGasParameters | SimulateContractParameters;

        const { request } =
          await publicClient.simulateContract(contractCallArgs);

        const hash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
        return hash;
      } catch (error) {
        // try {
        //   handleTransactionError(error as Error);
        // } catch (error) {
        //   console.error("CATCHED Attestation Error:", error);
        // }
        console.error("CATCHED Attestation Error:", error);
        return "error";
      }
    },

    onError: (error: Error) => {
      try {
        handleTransactionError(error);
      } catch (error) {
        console.error("CATCHED Attestation Error:", error);
      }
    },
    onSuccess: (receipt: string) => {
      console.log("Attestation successful! Transaction Hash:", receipt);
    },
  });
};

import { getAddress } from "ethers/lib/utils";
import {
  EstimateContractGasParameters,
  SimulateContractParameters,
} from "viem/actions";

/**
 * Custom hook to fetch attestation data based on a transaction hash.
 *
 * @param {string} transactionHash - The hash of the transaction to fetch attestation data for.
 */
export const useGetAttestationData = (transactionHash: string) => {
  return useQuery({
    queryKey: ["attestation"],
    queryFn: async () => {
      if (!transactionHash) {
        throw new Error("Transaction hash is required");
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/getAttestation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transactionHash }),
          }
        );

        const data = await response.json();
        console.log("Response Data:", data);
        return data;
      } catch (error) {
        console.error("Error fetching attestation data:", error);
        // Rethrow the error so that react-query can handle it
        throw error;
      }
    },
  });
};

import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";

export function handleTransactionError(error: Error) {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "Unknown Error";
      console.log("errorName", errorName);
      throw { reason: errorName, data: { message: errorName } };
    }

    const isInsufficientFundsError =
      error.walk((e) => e instanceof InsufficientFundsError) instanceof
      InsufficientFundsError;
    if (isInsufficientFundsError) {
      throw {
        reason: "Insufficient Funds",
        data: { message: "Insufficient Funds" },
      };
    }
    const isUserRejectedRequestError =
      error.walk((e) => e instanceof UserRejectedRequestError) instanceof
      UserRejectedRequestError;
    if (isUserRejectedRequestError) {
      throw {
        reason: "User Rejected Request",
        data: { message: "User Rejected Request" },
      };
    }
  }
  // unknown error
  throw {
    reason: "Transaction Failed",
    data: { message: String("unknown reason") },
  };
}

export const abi2 = [
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
