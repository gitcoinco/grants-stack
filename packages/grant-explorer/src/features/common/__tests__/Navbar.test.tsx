import { Shortlist } from "../Navbar";
import { screen } from "@testing-library/react";
import { renderWithContext } from "../../../test-utils";
import CustomerSupport from "../CustomerSupport";

describe("<Shortlist/>", () => {
  it("should not display a number when empty", () => {
    renderWithContext(<Shortlist count={0} roundUrlPath={""} />);

    /* Verify we are displaying the 0 */
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("should display the number when full", () => {
    renderWithContext(<Shortlist count={10} roundUrlPath={""} />);

    /* Verify we aren't displaying the 0 */
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});

describe("Support", () => {
  it("should display support options", () => {
    renderWithContext(<CustomerSupport />);

    /* Verify we have customer support options in the document */
    expect(screen.getByTestId("customer-support")).toBeInTheDocument();
  });
});
