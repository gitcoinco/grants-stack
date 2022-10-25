import { Spinner } from "../Spinner";
import { render, screen } from "@testing-library/react";

describe("<Spinner/>", () => {
  it("should display spinning logo", () => {
    render(<Spinner text={""}></Spinner>);

    expect(screen.getByTestId("spinner-logo")).toBeInTheDocument();
  });

  it("should display 'Loading...' text", () => {
    render(<Spinner text={""}></Spinner>);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should display given subtitle text", () => {
    const text = "Time to Spin";

    render(<Spinner text={text}></Spinner>);

    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
