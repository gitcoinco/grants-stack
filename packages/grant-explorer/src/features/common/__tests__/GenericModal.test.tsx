import { screen } from "@testing-library/react";
import GenericModal from "../GenericModal";
import { renderWithContext } from "../../../test-utils";

describe("<GenericModal />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display the modal when isOpen is true", () => {
    renderWithContext(<GenericModal isOpen setIsOpen={vi.fn()} />);

    expect(screen.getByTestId("generic-modal")).toBeInTheDocument();
  });

  it("should not display the modal when isOpen is false", () => {
    renderWithContext(<GenericModal isOpen={false} setIsOpen={vi.fn()} />);

    expect(screen.queryByTestId("generic-modal")).not.toBeInTheDocument();
  });

  it("should display custom title text when title is provided in props", () => {
    const modalTitle = "My cool modal";
    renderWithContext(
      <GenericModal isOpen={true} setIsOpen={vi.fn()} title={modalTitle} />
    );

    expect(screen.getByText(modalTitle)).toBeInTheDocument();
  });

  it("should render body element inside the modal if provided in props", () => {
    const testId = "modal-body";
    const body = <div data-testid={testId} />;
    renderWithContext(
      <GenericModal isOpen={true} setIsOpen={vi.fn()} body={body} />
    );

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it("should render children", () => {
    const expectedTestId = `child-test-id-123`;
    const child = <div data-testid={expectedTestId} />;
    renderWithContext(
      <GenericModal isOpen setIsOpen={vi.fn()} body={<div />}>
        {child}
      </GenericModal>
    );

    expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
  });
});
