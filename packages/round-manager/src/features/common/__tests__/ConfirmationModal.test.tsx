import { fireEvent, screen } from "@testing-library/react"
import { renderWrapped } from "../../../test-utils"
import ConfirmationModal from "../ConfirmationModal"


describe("<ConfirmationModal />", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should display the modal when isOpen is true", () => {
    renderWrapped(<ConfirmationModal isOpen setIsOpen={jest.fn()} confirmButtonAction={jest.fn()} />)

    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument()
  })

  it("should not display the modal when isOpen is false", () => {
    renderWrapped(<ConfirmationModal isOpen={false} setIsOpen={jest.fn()} confirmButtonAction={jest.fn()} />)

    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument()
  })

  it("should close the modal by default when cancel button is clicked", () => {
    const setIsOpen = jest.fn()
    renderWrapped(<ConfirmationModal isOpen setIsOpen={setIsOpen} confirmButtonAction={jest.fn()} />)

    const cancelButton = screen.getByRole("button", {name: /Cancel/i});
    fireEvent.click(cancelButton)

    expect(setIsOpen).toBeCalledTimes(1);
    expect(setIsOpen).toBeCalledWith(false);
  })

  it("should execute cancelButtonAction when cancelButtonAction is provided and cancel button is clicked", () => {
    const cancelButtonAction = jest.fn()
    renderWrapped(<ConfirmationModal isOpen setIsOpen={jest.fn()} confirmButtonAction={jest.fn()} cancelButtonAction={cancelButtonAction} />)

    const cancelButton = screen.getByRole("button", {name: /Cancel/i});
    fireEvent.click(cancelButton)

    expect(cancelButtonAction).toBeCalledTimes(1);
  })

  it("should execute confirmButtonAction when confirm button is clicked", () => {
    const confirmButtonAction = jest.fn()
    renderWrapped(<ConfirmationModal isOpen setIsOpen={jest.fn()} confirmButtonAction={confirmButtonAction} />)

    const confirmButton = screen.getByRole("button", {name: /Confirm/i});
    fireEvent.click(confirmButton)

    expect(confirmButtonAction).toBeCalledTimes(1);
  })

  // TODO(shavinac) refactor out redundant/unused props, or add tests for them
})