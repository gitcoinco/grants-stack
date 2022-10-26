import { fireEvent, screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";
import InfoModal from "../InfoModal";

describe("<InfoModal />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display the modal when isOpen is true", () => {
    renderWrapped(
      <InfoModal
        isOpen
        setIsOpen={jest.fn()}
        continueButtonAction={jest.fn()}
      />
    );

    expect(screen.getByTestId("info-modal")).toBeInTheDocument();
  });

  it("should not display the modal when isOpen is false", () => {
    renderWrapped(
      <InfoModal
        isOpen={false}
        setIsOpen={jest.fn()}
        continueButtonAction={jest.fn()}
      />
    );

    expect(screen.queryByTestId("info-modal")).not.toBeInTheDocument();
  });

  it("should close the modal by default when cancel button is clicked", () => {
    const setIsOpen = jest.fn();
    renderWrapped(
      <InfoModal
        isOpen
        setIsOpen={setIsOpen}
        continueButtonAction={jest.fn()}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(setIsOpen).toBeCalledTimes(1);
    expect(setIsOpen).toBeCalledWith(false);
  });

  it("should execute cancelButtonAction when cancelButtonAction is provided and cancel button is clicked", () => {
    const cancelButtonAction = jest.fn();
    renderWrapped(
      <InfoModal
        isOpen
        setIsOpen={jest.fn()}
        continueButtonAction={jest.fn()}
        cancelButtonAction={cancelButtonAction}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(cancelButtonAction).toBeCalledTimes(1);
  });

  it("should execute continueButtonAction when continue button is clicked", () => {
    const continueButtonAction = jest.fn();
    renderWrapped(
      <InfoModal
        isOpen
        setIsOpen={jest.fn()}
        continueButtonAction={continueButtonAction}
      />
    );

    const continueButton = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueButton);

    expect(continueButtonAction).toBeCalledTimes(1);
  });

  it("should display custom text for button that executes continueButtonAction when continueButtonText is provided in props", () => {
    const continueButtonText = "My Cool Button";
    const continueButtonAction = jest.fn();
    renderWrapped(
      <InfoModal
        isOpen
        setIsOpen={jest.fn()}
        continueButtonAction={continueButtonAction}
        continueButtonText={continueButtonText}
      />
    );

    const continueButton = screen.getByRole("button", {
      name: continueButtonText,
    });
    fireEvent.click(continueButton);

    expect(continueButtonAction).toBeCalledTimes(1);
  });

  it("should display custom title text when title is provided in props", () => {
    const modalTitle = "My cool modal";
    renderWrapped(
      <InfoModal
        isOpen={true}
        setIsOpen={jest.fn()}
        continueButtonAction={jest.fn()}
        title={modalTitle}
      />
    );

    expect(screen.getByText(modalTitle)).toBeInTheDocument();
  });

  it("should render body element inside the modal if provided in props", () => {
    const testId = "modal-body";
    const body = <div data-testid={testId} />;
    renderWrapped(
      <InfoModal
        isOpen={true}
        setIsOpen={jest.fn()}
        continueButtonAction={jest.fn()}
        body={body}
      />
    );

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it("should render children", () => {
    const expectedTestId = `child-test-id-123`;
    const child = <div data-testid={expectedTestId} />;
    renderWrapped(
      <InfoModal
        isOpen
        setIsOpen={jest.fn()}
        continueButtonAction={jest.fn()}
        body={<div />}
      >
        {child}
      </InfoModal>
    );

    expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
  });
});
