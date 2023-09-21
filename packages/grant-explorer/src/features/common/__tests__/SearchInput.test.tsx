import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { SortFilterDropdown, SearchInput } from "../SearchInput";
import { vi } from "vitest"; // Adjust the path accordingly

describe("<SortFilterDropdown />", () => {
  it("should render correctly", () => {
    const { getByText } = render(<SortFilterDropdown onChange={() => {}} />);

    expect(getByText("Sort")).toBeInTheDocument();
    expect(getByText("Round End (Earliest)")).toBeInTheDocument();
    expect(getByText("Round Start (Earliest)")).toBeInTheDocument();
  });

  it("calls the onChange prop when value changes", () => {
    const mockOnChange = vi.fn();
    render(<SortFilterDropdown onChange={mockOnChange} />);

    fireEvent.change(screen.getByPlaceholderText("Select Filter"), {
      target: { value: "round_desc" },
    });

    expect(mockOnChange).toHaveBeenCalled();
  });
});

describe("<SearchInput />", () => {
  it("should render correctly with a given search query", () => {
    const mockOnChange = vi.fn();
    const { getByPlaceholderText } = render(
      <SearchInput searchQuery="test" onChange={mockOnChange} />
    );

    expect(getByPlaceholderText("Search...")).toHaveValue("test");
  });

  it("calls the onChange prop when input value changes", () => {
    const mockOnChange = vi.fn();
    const { getByPlaceholderText } = render(
      <SearchInput searchQuery="" onChange={mockOnChange} />
    );

    fireEvent.change(getByPlaceholderText("Search..."), {
      target: { value: "new query" },
    });

    expect(mockOnChange).toHaveBeenCalledWith("new query");
  });
});
