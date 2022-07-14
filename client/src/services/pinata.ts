// eslint-disable-next-line
const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0YmE2NDc0NS1hYWFmLTRiOWEtODE4YS1kZmIzODkxOWRlZWEiLCJlbWFpbCI6ImVuZ2luZWVyaW5nQGdpdGNvaW4uY28iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOGU5ZTE4YTEwOTRkOGI3NTExNDYiLCJzY29wZWRLZXlTZWNyZXQiOiIyYTEwNDczMWIxMjJkMjhkOTIzZjAyNzViZWVlNmE4ZjdiNDFmOGNlYjZmNThhMjEzODQ1NWY2NDYyMDM3ZmY2IiwiaWF0IjoxNjU3NTQxMDMzfQ.RoIPOjVuu8DZiC24JR7C7Sk-U2EApk455gVMm3v2CyE";//process.env.REACT_APP_PINATA_JWT;
// eslint-disable-next-line
const GATEWAY = "https://gitcoin.mypinata.cloud";//process.env.REACT_APP_PINATA_GATEWAY;
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
