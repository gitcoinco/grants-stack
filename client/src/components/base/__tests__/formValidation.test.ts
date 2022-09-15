import { ValidationError } from "yup";
import { validateProjectForm, validateApplication } from "../formValidation";
import { RoundApplicationQuestion } from "../../../types";

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
      expect(error.message).toBe("Project Name is required");
      expect(error.name).toBe("ValidationError");
    }
  });

  it("returns url error if url is not valid", async () => {
    validInputs.website = "gitcoin.co/";
    try {
      await validateProjectForm(validInputs);
    } catch (e) {
      const error = e as ValidationError;
      expect(error.message).toBe(
        "Project Website must be a valid url. e.g. https://gitcoin.co/"
      );
      expect(error.name).toBe("ValidationError");
    }
  });

  it("Validates application form", async () => {
    const formInputs = {
      2: "Text Area Response",
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
