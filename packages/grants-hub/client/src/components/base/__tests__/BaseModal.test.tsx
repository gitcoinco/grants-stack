import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BaseModal } from "../BaseModal";

const closeMock = () => {};

describe("Base Modal", () => {
  it("should show modal", () => {
    render(
      <BaseModal isOpen onClose={closeMock}>
        <div>Test Modal</div>
      </BaseModal>
    );
    expect(screen.queryByText("Test Modal")).toBeInTheDocument();
  });

  it("should not show modal", () => {
    render(
      <BaseModal isOpen={false} onClose={closeMock}>
        <div>Test Modal</div>
      </BaseModal>
    );
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });
});
