import { render, fireEvent, screen } from "@testing-library/react";
import NavbarCart from "../NavbarCart";
import { makeApprovedProjectData } from "../../../test-utils";
import { beforeEach } from "vitest"; // replace with the correct path to your NavbarCart component

describe("<NavbarCart />", () => {
  beforeEach(() => {
    global.window.open = vi.fn();
  });

  test("renders the NavbarCart without errors", () => {
    render(<NavbarCart cart={[]} />);

    const navbarCart = screen.getByTestId("navbar-cart");
    expect(navbarCart).toBeInTheDocument();
  });

  test("displays the correct count of projects in the cart", () => {
    const mockCart = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];

    render(<NavbarCart cart={mockCart} />);

    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
  });

  test("does not display count badge when cart is empty", () => {
    render(<NavbarCart cart={[]} />);

    const badge = screen.queryByText(/(\d+)/); // This will match any number
    expect(badge).not.toBeInTheDocument();
  });

  test('opens a new window/tab with URL "#/cart" when clicked', () => {
    render(<NavbarCart cart={[]} />);

    const navbarCart = screen.getByTestId("navbar-cart");
    fireEvent.click(navbarCart);

    expect(window.open).toHaveBeenCalledWith("#/cart", "_blank");
  });
});
