import { fireEvent, render, screen } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import PassportConnect from "../PassportConnect";
import { BrowserRouter } from "react-router-dom";

const chainId = 5;
const roundId = faker.finance.ethereumAddress();
const txHash = faker.finance.ethereumAddress();

const useParamsFn = () => ({
  chainId: chainId,
  roundId: roundId,
  txHash: txHash,
});

const mockSigner = {
  data: {},
};


jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useParams: useParamsFn,
}));
jest.mock("wagmi", () => ({
  useSigner: () => mockSigner,
}));

describe("<PassportConnect/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Navigation Buttons", () => {

   it("shows Home and Connect to Passport breadcrumb", () => {
    render(<PassportConnect />, { wrapper: BrowserRouter });

    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Connect to Passport")).toBeInTheDocument();
   });

   it("shows back to browsing button on page load", () => {
    render(<PassportConnect />, { wrapper: BrowserRouter });

    expect(
      screen.getByTestId("back-to-browsing-button")
    ).toBeInTheDocument();
   });
  });

  describe("Passport Instructions", () => {
    it("Should show both tabs Have a Passport and Don't have a Passport on page load", async () => {
      render(<PassportConnect />, { wrapper: BrowserRouter });

      expect(screen.getByText("Have a Passport?")).toBeInTheDocument();

      expect(screen.getByText("Don't have a Passport?")).toBeInTheDocument();
    });


    it("Should load the contents of the Have a Passport tab", async () => {
      render(<PassportConnect />, { wrapper: BrowserRouter });

      expect(screen.getByTestId("have-a-passport-instructions")).toBeInTheDocument();
    });

    it("Clicking on the Don't have a Passport tab loads the content of the second tab", async () => {
      render(<PassportConnect />, { wrapper: BrowserRouter });

      fireEvent.click(screen.getByTestId("no-passport-tab"));

      expect(
        screen.getByTestId("no-passport-instructions")
      ).toBeInTheDocument();
    });

    it("Clicking on the Have a Passport tab loads the content of the first tab", async () => {
      render(<PassportConnect />, { wrapper: BrowserRouter });

      const tabs = screen.getAllByRole("tab");

      // click second tab
      fireEvent.click(screen.getByTestId("no-passport-tab"));

      // click first tab
      fireEvent.click(screen.getByTestId("have-a-passport-tab"));

      expect(
        screen.getByTestId("have-a-passport-instructions")
      ).toBeInTheDocument();

    });

  });

});
