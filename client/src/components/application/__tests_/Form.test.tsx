import { render, screen } from "@testing-library/react";
import Form from "../Form";

const roundApplication = {
  id: "String", // round contract address
  last_updated_on: "String", // epoch time
  application_schema: [
    {
      question: "Text Question",
      type: "TEXT", // this will be a limited set [TEXT, TEXTAREA, RADIO, MULTIPLE]
      required: true,
      info: "This is your text question", // optional
      // choices: ["String", "Number"], // optional
    },
  ],
};

describe("Application Form", () => {
  it("should show form", () => {
    render(<Form roundApplication={roundApplication} />);
  });
});
