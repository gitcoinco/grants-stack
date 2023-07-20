import { act, fireEvent, screen } from "@testing-library/react";
import {
  makeApprovedProjectData,
  renderWithContext,
} from "../../../test-utils";
import NavbarCart from "../NavbarCart";

describe("<NavbarCart/>", () => {
  it("SHOULD always show CART icon", () => {
    renderWithContext(<NavbarCart cart={[]} roundUrlPath={""} />);

    expect(screen.getByTestId("navbar-cart")).toBeInTheDocument();
  });

  it("SHOULD not display a number when empty", () => {
    renderWithContext(<NavbarCart cart={[]} roundUrlPath={""} />);

    /* Verify we are displaying the 0 */
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("SHOULD display the number when full", () => {
    const cart = [makeApprovedProjectData(), makeApprovedProjectData()];

    renderWithContext(<NavbarCart cart={cart} roundUrlPath={""} />);

    /* Verify we aren't displaying the 0 */
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("SHOULD not show dropdown on clicking cart icon WHEN cart is empty", async () => {
    renderWithContext(<NavbarCart cart={[]} roundUrlPath={""} />);

    const icon = screen.getByTestId("navbar-cart");

    await act(() => {
      fireEvent.click(icon);
    });

    expect(screen.queryByTestId("quick-view-summary")).not.toBeInTheDocument();
  });

  it("SHOULD show dropdown on clicking cart icon WHEN cart is NOT empty", async () => {
    const cart = [makeApprovedProjectData(), makeApprovedProjectData()];
    renderWithContext(<NavbarCart cart={cart} roundUrlPath={""} />);

    const icon = screen.getByTestId("navbar-cart");

    await act(() => {
      fireEvent.click(icon);
    });

    expect(screen.queryByTestId("quick-view-summary")).toBeInTheDocument();
  });

  it("SHOULD show View my cart button with count", async () => {
    const cart = [makeApprovedProjectData(), makeApprovedProjectData()];
    renderWithContext(<NavbarCart cart={cart} roundUrlPath={""} />);

    const icon = screen.getByTestId("navbar-cart");

    await act(() => {
      fireEvent.click(icon);
    });

    expect(screen.queryByText("View my cart (2)")).toBeInTheDocument();
  });

  it("SHOULD show project info in quick view summary", async () => {
    const cart = [makeApprovedProjectData(), makeApprovedProjectData()];
    renderWithContext(<NavbarCart cart={cart} roundUrlPath={""} />);

    const icon = screen.getByTestId("navbar-cart");

    await act(() => {
      fireEvent.click(icon);
    });

    expect(screen.queryAllByTestId("project-quick-view").length).toEqual(
      cart.length,
    );
  });
});
