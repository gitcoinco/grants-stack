import { ethers } from "ethers";
import { objectToDeterministicJSON } from "./deterministicJSON";

export const verifyMessageSignature = (
  validSigners: string[],
  signature: string,
  message: string,
): boolean => {
  const messageHash = ethers.utils.hashMessage(message);
  const messageDigest = ethers.utils.arrayify(messageHash);
  const sig = ethers.utils.splitSignature(signature);

  for (const address of validSigners) {
    const recoveredAddress = ethers.utils.recoverAddress(messageDigest, sig);
    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      return true;
    }
  }

  return false;
};

export const verifyApplicationMetadata = (
  projectId: string,
  owner: string[],
  applicationMetadata: any,
): boolean => {
  const signature = applicationMetadata.signature;
  const application = applicationMetadata.application;
  const deterministicApplication = objectToDeterministicJSON(
    application as any,
  );
  const hash = ethers.utils.solidityKeccak256(
    ["string"],
    [deterministicApplication],
  );

  const idSegments = application.project.id.split(":");

  return (
    verifyMessageSignature(owner, signature, hash)  &&

    // verify that the project id matches the project id in the application metadata
    ethers.utils.solidityKeccak256(
      ["uint256", "address", "uint256"],
      [idSegments[0], idSegments[1], idSegments[2]]
    ).toLowerCase() === projectId.toLowerCase()
  );
};
