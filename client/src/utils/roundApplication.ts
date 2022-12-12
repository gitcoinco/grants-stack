import { ethers } from "ethers";

const generateUniqueRoundApplicationID = (
  projectChainId: number,
  projectNumber: string,
  projectRegistryAddress: string
) => {
  return ethers.utils.solidityKeccak256(
    ["uint256", "address", "uint256"],
    [projectChainId, projectRegistryAddress, projectNumber]
  );
};

export default generateUniqueRoundApplicationID;
