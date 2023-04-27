// eslint-disable-next-line
const JWT = process.env.REACT_APP_PINATA_JWT;
// eslint-disable-next-line
const GATEWAY = process.env.REACT_APP_PINATA_GATEWAY;
const PIN_JSON_TO_IPFS_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const PIN_FILE_TO_IPFS_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export default class PinataClient {
  private jwt: string;

  private gateway: string;

  private pinJSONToIPFSURL: string;

  private pinFileToIPFSURL: string;

  constructor() {
    if (JWT === undefined || GATEWAY === undefined) {
      throw new Error(
        "remember to set the REACT_APP_PINATA_JWT and REACT_APP_PINATA_GATEWAY env vars"
      );
    }
    this.jwt = JWT!;
    this.gateway = GATEWAY!;
    this.pinJSONToIPFSURL = PIN_JSON_TO_IPFS_URL;
    this.pinFileToIPFSURL = PIN_FILE_TO_IPFS_URL;
  }

  fileURL(cid: string) {
    return `${GATEWAY}/ipfs/${cid}`;
  }

  fetchText(cid: string) {
    const url = this.fileURL(cid);
    return fetch(url).then((resp) => resp.text());
  }

  fetchJson(cid: string) {
    const url = this.fileURL(cid);
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

    return fetch(this.pinJSONToIPFSURL, {
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

    return fetch(this.pinFileToIPFSURL, {
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
