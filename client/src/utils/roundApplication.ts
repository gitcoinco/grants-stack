import { ethers } from "ethers";
import { addressesByChainID } from "../contracts/deployments";

const generateUniqueRoundApplicationID = (
  chainID: number,
  projectID: number
) => {
  const addresses = addressesByChainID(chainID);
  return ethers.utils.solidityKeccak256(
    ["uint256", "address", "uint256"],
    [chainID, addresses.projectRegistry, projectID]
  );
};

export default generateUniqueRoundApplicationID;
