import { render, fireEvent, screen, act } from "@testing-library/react";
import { FilterDropdown, FilterDropdownOption } from "./FilterDropdown";
import { vi, describe, test } from "vitest";

type FilterType = string;

describe("FilterDropdown", () => {
  const mockOptions: FilterDropdownOption<FilterType>[] = [
    {
      label: "Category 1",
      children: [
        { label: "Option 1", value: "opt1" },
        { label: "Option 2", value: "opt2" },
      ],
      allowMultiple: true,
    },
    {
      label: "Category 2",
      children: [
        { label: "Option 3", value: "opt3" },
        { label: "Option 4", value: "opt4" },
      ],
      allowMultiple: false,
    },
  ];

  test("renders without crashing", () => {
    render(
      <FilterDropdown options={mockOptions} onChange={vi.fn()} selected={[]} />
    );
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  test("displays correct label based on selected props", () => {
    render(
      <FilterDropdown options={mockOptions} onChange={vi.fn()} selected={[]} />
    );
    expect(screen.getByText("All")).toBeInTheDocument();

    render(
      <FilterDropdown
        options={mockOptions}
        onChange={vi.fn()}
        selected={["opt1"]}
      />
    );
    expect(screen.getByText("Option 1")).toBeInTheDocument();

    render(
      <FilterDropdown
        options={mockOptions}
        onChange={vi.fn()}
        selected={["opt1", "opt3"]}
      />
    );
    expect(screen.getByText("Multiple")).toBeInTheDocument();
  });

  test("calls onChange with correct value when an option is selected", async () => {
    const mockOnChange = vi.fn();

    render(
      <FilterDropdown
        options={mockOptions}
        onChange={mockOnChange}
        selected={[]}
      />
    );
    // open dropdown
    fireEvent.click(screen.getByText("All"));

    // expand category
    fireEvent.click(screen.getByText("Category 1"));

    await act(async () => {
      fireEvent.click(screen.getByText("Option 1"));
    });

    expect(mockOnChange).toHaveBeenCalledWith(["opt1"]);
  });

  test('resets to "All" when all button is clicked', () => {
    const mockOnChange = vi.fn();

    render(
      <FilterDropdown
        options={mockOptions}
        onChange={mockOnChange}
        selected={["opt1"]}
      />
    );
    // open the dropdown
    fireEvent.click(screen.getByText("Option 1"));

    fireEvent.click(screen.getByText("All"));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  test("handles multi-select logic correctly", async () => {
    const mockOnChange = vi.fn();
    render(
      <FilterDropdown
        options={mockOptions}
        onChange={mockOnChange}
        selected={["opt1"]}
      />
    );
    // open the dropdown
    fireEvent.click(screen.getByText("Option 1"));

    // expand category
    fireEvent.click(screen.getByText("Category 2"));

    await act(async () => {
      fireEvent.click(screen.getByText("Option 3"));
    });

    expect(mockOnChange).toHaveBeenCalledWith(["opt1", "opt3"]);

    await act(async () => {
      fireEvent.click(screen.getByText("Option 4"));
    });

    // Category 2 is not multi-select, so opt4 should replace opt3
    expect(mockOnChange).toHaveBeenCalledWith(["opt1", "opt4"]);
  });

  test("handles invalid selected values gracefully", () => {
    const mockOnChange = vi.fn();

    render(
      <FilterDropdown
        options={mockOptions}
        onChange={mockOnChange}
        selected={["invalid"]}
      />
    );
    expect(screen.getByText("All")).toBeInTheDocument();
  });
});
