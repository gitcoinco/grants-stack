import { AlloError } from ".";
import { Result, error, success } from "./common";

export interface IpfsUploader {
  (file: Blob | Record<string, unknown>): Promise<Result<string>>;
}

export function createPinataIpfsUploader(args: {
  token: string;
  endpoint: string;
  fetch?: typeof globalThis.fetch;
}): IpfsUploader {
  const {
    fetch = globalThis.fetch,
    token,
    endpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS",
  } = args;

  return async (
    file: Blob | Record<string, unknown>
  ): Promise<Result<string>> => {
    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        pinataMetadata: {},
        pinataOptions: {
          cidVersion: 1,
        },
      },
    };

    const fd = new FormData();
    let blob: Blob;

    if (file instanceof Blob) {
      blob = file;
    } else {
      blob = new Blob([JSON.stringify(file)], { type: "application/json" });
    }

    fd.append("file", blob);
    fd.append("pinataOptions", JSON.stringify(params.body.pinataOptions));
    fd.append("pinataMetadata", JSON.stringify(params.body.pinataMetadata));

    const res = await fetch(endpoint);

    if (res.ok) {
      return error(
        new AlloError(`Failed to upload file to IPFS: ${await res.text()}`)
      );
    }

    const json = (await res.json()) as { IpfsHash: string };

    return success(json.IpfsHash);
  };
}
