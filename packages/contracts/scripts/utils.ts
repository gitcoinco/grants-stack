import { ethers } from "ethers";


/**
 * Encodes the parameters for the ProgramFactory.create() function.
 * 
 * @param params 
 * @returns {string}
 */
export const encodeProgramParams = (params: any[]) => {
  return ethers.utils.defaultAbiCoder.encode(
    ["tuple(uint256 protocol, string pointer)", "address[]", "address[]"],
    params
  );
}

/**
 * Encodes the parameters for the RoundFactory.create() function.
 * 
 * @param params 
 * @returns {string}
 */
export const encodeRoundParameters = (params: any[]) => {
  return ethers.utils.defaultAbiCoder.encode(
    [
      "address",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "address",
      "tuple(uint256 protocol, string pointer)",
      "tuple(uint256 protocol, string pointer)",
      "address",
      "address[]"
    ],
    params
  );
}