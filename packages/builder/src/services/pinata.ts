import type { Config } from "common/src/config";

export default class PinataClient {
  private jwt: string;

  private gateway: string;

  private pinataBaseUrl: string;

  private pinJSONToIPFSUrl: string;

  private pinFileToIPFSUrl: string;

  constructor(config: Config) {
    this.jwt = config.pinata.jwt;
    this.gateway = config.ipfs.baseUrl;
    this.pinataBaseUrl = config.pinata.baseUrl.replace(/\/$/, "");

    this.pinJSONToIPFSUrl = `${this.pinataBaseUrl}/pinning/pinJSONToIPFS`;
    this.pinFileToIPFSUrl = `${this.pinataBaseUrl}/pinning/pinFileToIPFS`;
  }

  fileUrl(cid: string) {
    return `${this.gateway}/ipfs/${cid}`;
  }

  fetchText(cid: string) {
    const url = this.fileUrl(cid);
    return fetch(url).then((resp) => resp.text());
  }

  fetchJson(cid: string) {
    const url = this.fileUrl(cid);
    return fetch(url).then((resp) => resp.json());
  }

  baseRequestData(name: string) {
    return {
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name,
        keyvalues: {
          app: "grant-hub",
        },
      },
    };
  }

  pinJSON(object: any) {
    const data = {
      ...this.baseRequestData("grant-hub"),
      pinataContent: object,
    };

    return fetch(this.pinJSONToIPFSUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.jwt}`,
      },
      body: JSON.stringify(data),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  }

  pinFile(file: Blob) {
    const fd = new FormData();
    const requestData = this.baseRequestData("project-image");

    fd.append("file", file);
    fd.append("pinataOptions", JSON.stringify(requestData.pinataOptions));
    fd.append("pinataMetadata", JSON.stringify(requestData.pinataMetadata));

    return fetch(this.pinFileToIPFSUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
      body: fd,
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  }
}
