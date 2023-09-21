import { fireEvent, screen } from "@testing-library/react";
import { renderWithContext } from "../../../test-utils";
import ConfirmationModal from "../ConfirmationModal";

describe("<ConfirmationModal />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display the modal when isOpen is true", () => {
    renderWithContext(
      <ConfirmationModal
        isOpen
        setIsOpen={vi.fn()}
        confirmButtonAction={vi.fn()}
      />
    );

    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });

  it("should not display the modal when isOpen is false", () => {
    renderWithContext(
      <ConfirmationModal
        isOpen={false}
        setIsOpen={vi.fn()}
        confirmButtonAction={vi.fn()}
      />
    );

    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
  });

  it("should close the modal by default when cancel button is clicked", () => {
    const setIsOpen = vi.fn();
    renderWithContext(
      <ConfirmationModal
        isOpen
        setIsOpen={setIsOpen}
        confirmButtonAction={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(setIsOpen).toBeCalledTimes(1);
    expect(setIsOpen).toBeCalledWith(false);
  });

  it("should execute cancelButtonAction when cancelButtonAction is provided and cancel button is clicked", () => {
    const cancelButtonAction = vi.fn();
    renderWithContext(
      <ConfirmationModal
        isOpen
        setIsOpen={vi.fn()}
        confirmButtonAction={vi.fn()}
        cancelButtonAction={cancelButtonAction}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(cancelButtonAction).toBeCalledTimes(1);
  });

  it("should execute confirmButtonAction when confirm button is clicked", () => {
    const confirmButtonAction = vi.fn();
    renderWithContext(
      <ConfirmationModal
        isOpen
        setIsOpen={vi.fn()}
        confirmButtonAction={confirmButtonAction}
      />
    );

    const confirmButton = screen.getByRole("button", { name: /Confirm/i });
    fireEvent.click(confirmButton);

    expect(confirmButtonAction).toBeCalledTimes(1);
  });

  it("should display custom text for button that executes confirmButtonAction when confirmButtonText is provided in props", () => {
    const confirmButtonText = "My Cool Button";
    const confirmButtonAction = vi.fn();
    renderWithContext(
      <ConfirmationModal
        isOpen
        setIsOpen={vi.fn()}
        confirmButtonAction={confirmButtonAction}
        confirmButtonText={confirmButtonText}
      />
    );

    const confirmButton = screen.getByRole("button", {
      name: confirmButtonText,
    });
    fireEvent.click(confirmButton);

    expect(confirmButtonAction).toBeCalledTimes(1);
  });

  it("should display custom title text when title is provided in props", () => {
    const modalTitle = "My cool modal";
    renderWithContext(
      <ConfirmationModal
        isOpen={true}
        setIsOpen={vi.fn()}
        confirmButtonAction={vi.fn()}
        title={modalTitle}
      />
    );

    expect(screen.getByText(modalTitle)).toBeInTheDocument();
  });

  it("should render body element inside the modal if provided in props", () => {
    const testId = "modal-body";
    const body = <div data-testid={testId} />;
    renderWithContext(
      <ConfirmationModal
        isOpen={true}
        setIsOpen={vi.fn()}
        confirmButtonAction={vi.fn()}
        body={body}
      />
    );

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
