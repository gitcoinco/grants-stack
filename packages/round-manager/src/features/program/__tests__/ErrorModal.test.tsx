import { screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";
import ErrorModal from "../../common/ErrorModal";

jest.mock("../../api/services/ipfs");
jest.mock("../../api/services/program");
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

  it("does not show error modal heading when there is no error", async () => {
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
});
