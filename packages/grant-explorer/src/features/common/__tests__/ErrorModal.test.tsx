import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithContext } from "../../../test-utils";
import ErrorModal from "../../common/ErrorModal";

vi.mock("../../common/Auth");
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

describe("<ErrorModal />", () => {
  it("shows error modal heading and error message", async () => {
    renderWithContext(
      <ErrorModal
        heading="error title"
        subheading="this is an error message"
        isOpen={true}
        setIsOpen={() => {
          /**/
        }}
      />
    );
    expect(await screen.findByTestId("error-heading")).toBeInTheDocument();
    expect(await screen.findByTestId("error-message")).toBeInTheDocument();
  });

  it("does not show error modal heading or message when modal is not open", async () => {
    renderWithContext(
      <ErrorModal
        heading="error title"
        subheading="this is an error message"
        isOpen={false}
        setIsOpen={() => {
          /**/
        }}
      />
    );
    expect(screen.queryByTestId("error-heading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("should call the try again callback and close the modal if try again is clicked", () => {
    const tryAgainFn = vi.fn();
    const setIsOpenFn = vi.fn();

    renderWithContext(
      <ErrorModal
        heading="error title"
        subheading="this is an error message"
        isOpen={true}
        setIsOpen={setIsOpenFn}
        onTryAgain={tryAgainFn}
      />
    );
    fireEvent.click(screen.getByTestId("tryAgain"));

    expect(tryAgainFn).toBeCalledTimes(1);
    expect(setIsOpenFn).toBeCalledTimes(1);
    expect(setIsOpenFn).toBeCalledWith(false);
  });

  it("should call the done callback and close the modal if done is clicked", () => {
    const doneFn = vi.fn();
    const setIsOpenFn = vi.fn();

    renderWithContext(
      <ErrorModal
        heading="error title"
        subheading="this is an error message"
        isOpen={true}
        setIsOpen={setIsOpenFn}
        onDone={doneFn}
      />
    );
    fireEvent.click(screen.getByTestId("done"));

    expect(doneFn).toBeCalledTimes(1);
    expect(setIsOpenFn).toBeCalledTimes(1);
    expect(setIsOpenFn).toBeCalledWith(false);
  });

  it("should close the modal if close on background click is enabled and background is clicked", () => {
    const doneFn = vi.fn();
    const setIsOpenFn = vi.fn();

    renderWithContext(
      <ErrorModal
        heading="error title"
        subheading="this is an error message"
        isOpen={true}
        closeOnBackgroundClick={true}
        setIsOpen={setIsOpenFn}
        onDone={doneFn}
      />
    );
    fireEvent.click(screen.getByTestId("backdrop"));

    /** Need to add timeout for the function to actually be called */
    waitFor(
      () => {
        expect(setIsOpenFn).toBeCalledTimes(1);
        expect(setIsOpenFn).toBeCalledWith(false);
      },
      {
        timeout: 10_000,
      }
    );
  });
});
