import { AttestInput } from "../config";
import { getAddress } from "ethers/lib/utils";
import { Abi } from "viem";
import {
  EstimateContractGasParameters,
  SimulateContractParameters,
} from "viem/actions";
/**
 * Utility function to create contract call arguments.
 */
export const createContractCallArgs = (
  data: AttestInput,
  schema: string,
  easAddress: string,
  abi: Abi,
  attestationFee?: bigint
) => {
  const args = {
    schema: schema,
    data: {
      recipient: data.message.recipient,
      expirationTime: BigInt(0),
      revocable: data.message.revocable,
      refUID: data.message.refUID,
      data: data.message.data,
      value: attestationFee ?? BigInt(0),
    },
    signature: {
      v: data.signature.v,
      r: data.signature.r,
      s: data.signature.s,
    },
    deadline: BigInt("0"),
    attester: getAddress(data.message.attester),
  };

  const contractCallArgs = {
    address: getAddress(easAddress),
    abi: abi,
    functionName: "attestByDelegation",
    args: [args],
    value: attestationFee ?? BigInt(0),
  } as EstimateContractGasParameters | SimulateContractParameters;
  return contractCallArgs;
};
