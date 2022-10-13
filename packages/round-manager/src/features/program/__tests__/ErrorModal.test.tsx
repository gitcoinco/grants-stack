import { fireEvent, screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";
import ErrorModal from "../../common/ErrorModal";

jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

describe("<ErrorModal />", () => {
  it("shows error modal heading and error message", async () => {
    renderWrapped(
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
    renderWrapped(
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
    const tryAgainFn = jest.fn();
    const setIsOpenFn = jest.fn();

    renderWrapped(
      <ErrorModal
        heading="error title"
        subheading="this is an error message"
        isOpen={true}
        setIsOpen={setIsOpenFn}
        tryAgainFn={tryAgainFn}
      />
    );
    fireEvent.click(screen.getByTestId("tryAgain"));

    expect(tryAgainFn).toBeCalledTimes(1);
    expect(setIsOpenFn).toBeCalledTimes(1);
    expect(setIsOpenFn).toBeCalledWith(false);
  });

  it("should call the done callback and close the modal if done is clicked", () => {
    const doneFn = jest.fn();
    const setIsOpenFn = jest.fn();

    renderWrapped(
      <ErrorModal
        heading="error title"
        subheading="this is an error message"
        isOpen={true}
        setIsOpen={setIsOpenFn}
        doneFn={doneFn}
      />
    );
    fireEvent.click(screen.getByTestId("done"));

    expect(doneFn).toBeCalledTimes(1);
    expect(setIsOpenFn).toBeCalledTimes(1);
    expect(setIsOpenFn).toBeCalledWith(false);
  });
});
