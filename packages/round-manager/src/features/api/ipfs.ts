import { pinToIPFS } from "./utils";
import { IPFSObject } from "./types";
/*TODO: delete this*/
type IpfsHash = string;
export const saveToIPFS = async (object: IPFSObject): Promise<IpfsHash> => {
  const resp = await pinToIPFS(object);

  console.log("Added file to IPFS:", resp.IpfsHash);
  return resp.IpfsHash;
};
