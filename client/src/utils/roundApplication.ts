import { ethers } from "ethers";
import { addressesByChainID } from "../contracts/deployments";

const generateUniqueRoundApplicationID = (
  chainID: number,
  projectID: string
) => {
  const addresses = addressesByChainID(chainID);
  return ethers.utils.solidityKeccak256(
    ["uint256", "address", "uint256"],
    [chainID, addresses.projectRegistry, projectID.split(":")[2]]
  );
};

export default generateUniqueRoundApplicationID;
