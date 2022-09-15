import RoundApplicationBuilder from "../../utils/RoundApplicationBuilder";
import { RoundApplicationMetadata, Project } from "../../types";
import Lit from "../../services/lit";

jest.mock("../../services/lit");

const roundApplicationMetadata: RoundApplicationMetadata = {
  lastUpdatedOn: 1657817494040,
  application_schema: [],
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
    (Lit as jest.Mock).mockReturnValue({
      encryptString: () => ({
        encryptedString: new Blob(["encTest"], {
          type: "application/octet-stream",
        }),
        encryptedSymmetricKey: "symKeyTest",
      }),
    });

    const builder = new RoundApplicationBuilder(
      true,
      project,
      roundApplicationMetadata,
      "0x000000000000000000000000000000000000beaf",
      "testnet"
    );
    const application = await builder.build("0x1234", formInputs);

    expect(application.project).toEqual(project);
    expect(application.round).toEqual("0x1234");
    expect(application.recipient).toEqual(
      "0x000000000000000000000000000000000000beaf"
    );

    // PROJECT and RECIPIENT are not included in the answers
    expect(application.answers.length).toEqual(
      roundApplicationMetadata.applicationSchema.length - 2
    );

    const emailAnswer = application.answers[0]!;
    expect(emailAnswer.answer).toBeUndefined();
    expect(emailAnswer.encryptedAnswer).not.toBeUndefined();
    expect(emailAnswer.encryptedAnswer!.ciphertext).not.toBeUndefined();
    expect(
      emailAnswer.encryptedAnswer!.encryptedSymmetricKey
    ).not.toBeUndefined();
  });
});

export {};
