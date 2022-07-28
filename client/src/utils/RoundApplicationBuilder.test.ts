import RoundApplicationBuilder from "./RoundApplicationBuilder";
import { RoundApplicationMetadata, Project } from "../types";

const roundApplicationMetadata: RoundApplicationMetadata = {
  lastUpdatedOn: 1657817494040,
  publicKey: {
    alg: "RSA-OAEP-256",
    e: "AQAB",
    ext: true,
    key_ops: ["encrypt"],
    kty: "RSA",
    // eslint-disable-next-line
    n: "rgnB-bjh4fDIf_BUgm6r3_ReNY1ASIZfxTnXeETwVIuvIEYtLriuUQ2MzsPZxY7plB-TkccUmjOUDTe3F_huLbqvMUpNyVqUlKgeLc77xdzL8Aq8rlPd8EFDQSJ2v1rPoEbfp9kRVK-aEfpqd6dHF5NxTMrLufbhp2M3nOthf5DL-V6mgGXkmYUllpmu2gRE5gFVp9wL2TruCalR_qIH_UP6x-AP09Ef6h2lIOsGjPQVbiIkPTK1iYx4deFEn3mtW_4Ih4kIKBKaSYz1HOO12uXQToS2grx7RH5LLnKWFEml2atf66pa-MmxUipYMFaRUOZIB4m2lGoNxqEqlnzFvmLfqgc0W7OPsrG5HdZOwvY4A-0WMMQwLNJLaHuPH8lcjjseImDrJPtaa0niYYJty6q_GuOC-pj_1e6JI7eX4wrboS2sYdWfxTyoOnW1hXFoeDfPzF1-DXhAKO8PTmuQw0wEg5fphWIon4oo5cQgYbuNEny3dpC8vMnmsHXkZNGXHDfmJ3GQ7rHYP5hvUtVhwycQKmhrAC8QtxWCUnrW6WMjHEr0GiOotmXuhh6AYKvZ820gwaXZXytDYCDy6WWAhaonY9MAB0xjEZyWZ9UG1KA2zyk42A4LNJiZdOTVx2s5x39-Zc1BZEjB95GWPrFHg_0O75SoPZC3IIblJI5Wsy0",
  },
  applicationSchema: [
    {
      id: 0,
      question: "Email",
      type: "TEXT",
      required: true,
      info: "",
      encrypted: true,
      choices: [],
    },
    {
      id: 1,
      question: "Twitter",
      type: "TEXT",
      required: true,
      info: "",
      choices: [],
    },
    {
      id: 2,
      question: "Github",
      type: "TEXT",
      required: true,
      info: "",
      choices: [],
    },
    {
      id: 3,
      question: "Funding Source",
      type: "TEXT",
      required: true,
      info: "",
      choices: [],
    },
    {
      id: 4,
      question: "Profit2022",
      type: "TEXT",
      required: true,
      info: "",
      choices: [],
    },
    {
      id: 5,
      question: "Team Size",
      type: "TEXT",
      required: true,
      info: "",
      choices: [],
    },
    {
      id: 6,
      question: "Project",
      type: "PROJECT",
      required: true,
      info: "",
      choices: [],
    },
    {
      id: 7,
      question: "Recipient Address",
      type: "RECIPIENT",
      required: true,
      info: "",
      choices: [],
    },
  ],
};

const formInputs = {
  0: "email",
  1: "tw",
  2: "gh",
  3: "fund",
  4: "prof",
  5: "size",
  6: "999",
  7: "0x000000000000000000000000000000000000beaf",
};

const project: Project = {
  lastUpdated: 0,
  id: "1",
  title: "My Project",
  description: "description 1234",
  website: "http://example.com",
  bannerImg: "project image 1234",
  logoImg: "logo image 1234",
  metaPtr: {
    protocol: "1",
    pointer: "pointer 1234",
  },
};

describe("round application builder", () => {
  it("builds", async () => {
    const builder = new RoundApplicationBuilder(
      false,
      project,
      roundApplicationMetadata
    );
    const application = await builder.build("0x1234", formInputs);

    expect(application.project).toEqual(project);
    expect(application.round).toEqual("0x1234");
    expect(application.recipient).toEqual(
      "0x000000000000000000000000000000000000beaf"
    );
    expect(application.answers.length).toEqual(
      roundApplicationMetadata.applicationSchema.length - 2
    );
  });
});

export {};
