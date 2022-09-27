import { ValidationError } from "yup";
import { RoundApplicationQuestion } from "../../../types";
import { validateApplication, validateProjectForm } from "../formValidation";

const validInputs = {
  title: "Project Title",
  description: "Project Description",
  website: "https://gitcoin.co/",
  challenges: "Project Challenges",
  roadmap: "Project Roadmap",
};

describe("Form Validation", () => {
  it("returns originall inputs if they are valid", async () => {
    const validation = await validateProjectForm(validInputs);

    expect(validation).toBe(validInputs);
  });

  it("returns error if title is empty string", async () => {
    validInputs.title = "";
    try {
      await validateProjectForm(validInputs);
    } catch (e) {
      const error = e as ValidationError;
      const innerError = error.inner[0] as ValidationError;
      expect(innerError.message).toBe("Project Name is required");
      expect(error.name).toBe("ValidationError");
    }
  });

  it("returns url error if url is not valid", async () => {
    validInputs.website = "gitcoin.co/";
    try {
      await validateProjectForm(validInputs);
    } catch (e) {
      const error = e as ValidationError;
      const innerError = error.inner[1] as ValidationError;
      expect(innerError.message).toBe(
        "Project Website must be a valid url. e.g. https://gitcoin.co/"
      );
      expect(error.name).toBe("ValidationError");
    }
  });

  it("Validates application form", async () => {
    const formInputs = {
      2: "Text Area Response",
      4: "0xA4ca1b15fE81F57cb2d3f686c7B13309906cd37B",
      isSafe: "No",
    };

    const defaultInputs: RoundApplicationQuestion[] = [
      {
        id: 1,
        question: "Text Question",
        type: "TEXT",
        required: true,
        info: "This is your text question",
      },
      {
        question: "Text Area Question",
        type: "TEXTAREA",
        required: true,
        info: "This is a text question",
        id: 2,
      },
      {
        question: "Radio Input Question",
        type: "RADIO",
        required: false,
        info: "This is a radio question",
        choices: ["Option 1", "Option 2"],
        id: 3,
      },
      {
        id: 4,
        question: "Recipient Address",
        type: "RECIPIENT",
        required: true,
        info: "This is your recipient address",
      },
    ];
    try {
      await validateApplication(defaultInputs, formInputs);
      throw new Error(
        "expected to catch a validation error but there was no error"
      );
    } catch (e) {
      const error = e as ValidationError;
      expect(error.message).toBe("Text Question is required");
      expect(error.name).toBe("ValidationError");
    }
  });
});
