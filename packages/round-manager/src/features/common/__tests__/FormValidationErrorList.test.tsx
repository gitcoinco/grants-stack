import { screen } from "@testing-library/react";
import FormValidationErrorList from "../FormValidationErrorList";
import { renderWrapped } from "../../../test-utils";

describe("FormValidationErrorList", () => {
  it("Should render no errors", () => {
    renderWrapped(<FormValidationErrorList errors={null} />);
    const alertElement = screen.queryByRole("alert");
    expect(alertElement).not.toBeInTheDocument();
  });

  it("Should render a single error", () => {
    const errors = {
      field1: { message: "Lorem ipsum dolor sit amet" },
    };
    renderWrapped(<FormValidationErrorList errors={errors} />);
    const alertElement = screen.getByRole("alert");
    expect(alertElement).toBeInTheDocument();

    const errorElement = screen.getByText("Field1: Lorem ipsum dolor sit amet");
    expect(errorElement).toBeInTheDocument();
  });

  it("Should render multiple errors", () => {
    const errors = {
      field1: { message: "Lorem ipsum dolor sit amet" },
      field2: { message: "Consectetur adipiscing elit" },
    };
    renderWrapped(<FormValidationErrorList errors={errors} />);
    const alertElement = screen.getByRole("alert");
    expect(alertElement).toBeInTheDocument();

    const errorElement1 = screen.getByText(
      "Field1: Lorem ipsum dolor sit amet"
    );
    expect(errorElement1).toBeInTheDocument();

    const errorElement2 = screen.getByText(
      "Field2: Consectetur adipiscing elit"
    );
    expect(errorElement2).toBeInTheDocument();
  });
});
