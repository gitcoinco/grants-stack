import { ValidationError } from "yup";
import { validateProjectForm, validateApplication } from "../formValidation";

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
      text_area_question: "Text Area Response",
    };
    const defaultInputs = [
      {
        question: "Text Question",
        type: "TEXT",
        required: true,
        info: "This is your text question",
        id: "text_question",
      },
      {
        question: "Text Area Question",
        type: "TEXTAREA",
        required: true,
        info: "This is a text question",
        id: "text_area_question",
      },
      {
        question: "Radio Input Question",
        type: "RADIO",
        required: false,
        info: "This is a radio question",
        choices: ["Option 1", "Option 2"],
        id: "radio_input_question",
      },
    ];
    try {
      await validateApplication(defaultInputs, formInputs);
    } catch (e) {
      const error = e as ValidationError;
      expect(error.message).toBe("Text Question is required");
      expect(error.name).toBe("ValidationError");
    }
  });
});
