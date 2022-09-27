import { pinToIPFS } from "./utils";

type IpfsHash = string;
export const saveToIPFS = async (object: any): Promise<IpfsHash> => {
  const resp = await pinToIPFS(object);

  console.log("Added file to IPFS:", resp.IpfsHash);
  return resp.IpfsHash;
};
