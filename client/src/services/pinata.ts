// eslint-disable-next-line
const jwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0YmE2NDc0NS1hYWFmLTRiOWEtODE4YS1kZmIzODkxOWRlZWEiLCJlbWFpbCI6ImVuZ2luZWVyaW5nQGdpdGNvaW4uY28iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZjA5MzQwMTc2ZGQ2YjY3ZWRkMjQiLCJzY29wZWRLZXlTZWNyZXQiOiJmNzIyYzAyNjllZTdhM2Y0NzAwZDE2YTVmYjBmZGQ5OTZlMWNhMDM3Y2IwZDJkZmI1MmZiNWQyMjYwZjg1OTM3IiwiaWF0IjoxNjU2NTYyODkyfQ.qYcmSfln8YyHk7EtTWkvDZ4C5eiNBEprJj_gBgzupeI`;
const pinJSONToIPFSURL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const pinFileToIPFSURL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export default class PinataClient {
  pinJSON(object: any) {
    const data = {
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: "project-metadata",
        keyvalues: {
          app: "grant-hub",
        },
      },
      pinataContent: object,
    };

    return fetch(pinJSONToIPFSURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
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
    fd.append("file", file);
    fd.append("pinataOptions", '{"cidVersion": 1}');
    fd.append(
      "pinataMetadata",
      '{"name": "project-image", "keyvalues": {"app": "grant-hub"}}'
    );

    return fetch(pinFileToIPFSURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
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
