import { RoundApplicationMetadata } from "data-layer";
import RoundApplicationBuilder from "../../utils/RoundApplicationBuilder";
import { Project } from "../../types";
import Lit from "../../services/lit";

jest.mock("../../services/lit");

const roundApplicationMetadata: RoundApplicationMetadata = {
  version: "2.0.0",
  lastUpdatedOn: 1657817494040,
  applicationSchema: {
    requirements: {
      github: { required: false, verification: false },
      twitter: { required: false, verification: false },
    },
    questions: [
      {
        id: 0,
        type: "text",
        title: "Email",
        required: true,
        encrypted: true,
        hidden: true,
      },
      {
        id: 1,
        type: "text",
        title: "Twitter",
        required: true,
        encrypted: true,
        hidden: true,
      },
      {
        id: 2,
        type: "text",
        title: "Github",
        required: true,
        encrypted: true,
        hidden: true,
      },
      {
        id: 3,
        type: "text",
        title: "Funding Source",
        required: true,
        encrypted: true,
        hidden: true,
      },
      {
        id: 4,
        type: "text",
        title: "Profit2022",
        required: true,
        encrypted: true,
        hidden: true,
      },
      {
        id: 5,
        type: "text",
        title: "Team Size",
        required: true,
        encrypted: true,
        hidden: true,
      },
      {
        id: 6,
        type: "project",
      },
      {
        id: 7,
        type: "recipient",
      },
    ],
  },
};

const formInputs = {
  0: "email",
  1: "tw",
  2: "gh",
  3: "fund",
  4: "prof",
  5: "size",
  6: "999",
  7: "0x000000000000000000000000000000000000bEAF",
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
      "0x000000000000000000000000000000000000bEAF",
      "testnet"
    );
    const application = await builder.build("0x1234", formInputs);

    expect(application.project).toEqual(project);
    expect(application.round).toEqual("0x1234");
    expect(application.recipient).toEqual(
      "0x000000000000000000000000000000000000bEAF"
    );

    // PROJECT and RECIPIENT are not included in the answers
    expect(application.answers.length).toEqual(
      roundApplicationMetadata.applicationSchema.questions.length - 2
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
