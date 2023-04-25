import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import Breadcrumb from "../Breadcrumb";

describe("Breadcrumb component", () => {
  it("renders a list of breadcrumb items", () => {
    const items = [
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
      { name: "Product Details", path: "/products/123" },
    ];

    const { getAllByRole } = render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );

    const links = getAllByRole("link");

    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveTextContent("Products");
    expect(links[1]).toHaveAttribute("href", "/products");
    expect(links[2]).toHaveTextContent("Product Details");
    expect(links[2]).toHaveAttribute("href", "/products/123");
  });
});
