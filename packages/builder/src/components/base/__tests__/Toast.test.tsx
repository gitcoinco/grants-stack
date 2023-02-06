import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Toast from "../Toast";

const closeMock = () => {};

describe("Toast", () => {
  it("should show toast", () => {
    render(
      <Toast onClose={closeMock} show>
        <p>Toast</p>
      </Toast>
    );

    expect(screen.queryByText("Toast")).toBeInTheDocument();
  });

  it("should not show toast", () => {
    render(
      <Toast onClose={closeMock} show={false}>
        <p>Toast</p>
      </Toast>
    );

    expect(screen.queryByText("Toast")).not.toBeInTheDocument();
  });
});
