import { AnyJson } from "..";
import { AlloError } from "./allo";
import { Result, error, success } from "./common";

export interface IpfsUploader {
  (file: Blob | AnyJson): Promise<Result<string>>;
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

  return async (file: Blob | AnyJson): Promise<Result<string>> => {
    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        pinataMetadata: {
          name: "Gitcoin.co",
          keyvalues: {
            app: "Gitcoin.co",
          },
        },
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

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
      // Include any other headers or options as needed
    });

    if (!res.ok) {
      return error(
        new AlloError(`Failed to upload file to IPFS: ${await res.text()}`)
      );
    }

    const json = (await res.json()) as { IpfsHash: string };

    return success(json.IpfsHash);
  };
}
