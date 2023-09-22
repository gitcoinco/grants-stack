import ViewCart from "./ViewCartPage/ViewCartPage";
import { fireEvent, render, screen } from "@testing-library/react";
import { CartProject } from "../api/types";
import {
  makeApprovedProjectData,
  mockBalance,
  mockNetwork,
  mockSigner,
} from "../../test-utils";
import { RoundProvider } from "../../context/RoundContext";
import { faker } from "@faker-js/faker";
import { MemoryRouter } from "react-router-dom";
import { getVotingTokenOptions } from "../api/utils";

process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID = "12";
const chainId = 5;
const roundId = faker.finance.ethereumAddress();
const userAddress = faker.finance.ethereumAddress();

const mockAccount = {
  address: userAddress,
  isConnected: true,
};

const useParamsFn = () => ({
  chainId,
  roundId,
});

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
}));
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
  ...jest.requireActual("@rainbow-me/rainbowkit"),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: useParamsFn,
}));
jest.mock("../../api/passport", () => ({
  ...jest.requireActual("../../api/passport"),
  fetchPassport: () => Promise.resolve({ score: 10000000 }),
}));

describe.skip("View Cart Page", () => {
  describe("Projects", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows list of projects with project name", () => {
      const cart: CartProject[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      renderWrapped();

      const projects = screen.getAllByTestId("cart-project");
      expect(projects.length).toEqual(cart.length);
      projects.forEach((project, i) => {
        expect(project.textContent).toContain(cart[i].projectMetadata.title);
      });
    });

    it("shows message that you have no projects", () => {
      renderWrapped();

      screen.getByText(/Cart is empty./i);
    });

    it("moves project from final donation to cart when clicking the send back button", async () => {
      const setCart = jest.fn();

      renderWrapped();

      // expect(screen.getAllByTestId("project").length).toEqual(0);
      expect(screen.getAllByTestId("cart-project").length).toEqual(2);

      /* Click the first project */
      const removeProjectFromCart =
        screen.getAllByTestId("remove-from-cart")[0];
      fireEvent.click(removeProjectFromCart);

      expect(setCart).toHaveBeenCalled();
    });

    it("displays the bread crumbs", async () => {
      renderWrapped();

      expect(await screen.findByTestId("bread-crumbs")).toBeInTheDocument();
    });
  });

  describe("Summary", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows default amount when you have no projects in cart", () => {
      renderWrapped();

      const totalDonation = screen.getByTestId("totalDonation");
      expect(totalDonation).toHaveTextContent("0");
    });

    it("reflects a change in donation to one project in the final contribution", () => {
      const cart: CartProject[] = [makeApprovedProjectData()];

      renderWrapped();

      /* Set donation amount on one project */
      const projectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${cart[0].projectMetadata.title}`,
      });

      fireEvent.change(projectDonationInput, {
        target: {
          value: "10",
        },
      });

      const totalDonation = screen.getByTestId("totalDonation");
      expect(totalDonation).toHaveTextContent("10");
    });

    it("reflects a change in donation to two projects in the final contribution", () => {
      const cart: CartProject[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      renderWrapped();

      /* Set donation amount on one project */
      const projectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${cart[0].projectMetadata.title}`,
      });
      fireEvent.change(projectDonationInput, {
        target: {
          value: "10",
        },
      });

      const secondProjectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${cart[1].projectMetadata.title}`,
      });
      fireEvent.change(secondProjectDonationInput, {
        target: {
          value: "20",
        },
      });

      const totalDonation = screen.getByTestId("totalDonation");
      expect(totalDonation).toHaveTextContent("30");

      /* Lower donation */
      fireEvent.change(
        screen.getByRole("spinbutton", {
          name: `Donation amount for project ${cart[1].projectMetadata.title}`,
        }),
        {
          target: {
            value: "10",
          },
        }
      );

      expect(screen.getByTestId("totalDonation")).toHaveTextContent("20");
    });

    it("updates token summary based on selected token", async () => {
      const chainId = 5;

      const useParamsFn = () => ({
        chainId,
        roundId,
      });

      jest.mock("react-router-dom", () => ({
        ...jest.requireActual("react-router-dom"),
        useParams: useParamsFn,
      }));

      renderWrapped();

      const options = getVotingTokenOptions(chainId);
      expect(screen.getByTestId("summaryPayoutToken")).toHaveTextContent(
        options[0].name
      );
    });
  });

  describe("Submit Your Donation", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows error when clicking on submit with a donation field empty", async () => {
      renderWrapped();

      /* Click on Confirm Button */
      const confirmButton = screen.getByTestId("handle-confirmation");
      fireEvent.click(confirmButton);

      expect(
        await screen.queryByTestId("confirm-modal")
      ).not.toBeInTheDocument();
      expect(
        await screen.queryByTestId("insufficientBalance")
      ).not.toBeInTheDocument();
      expect(await screen.queryByTestId("emptyInput")).toBeInTheDocument();
    });

    it("shows error when clicking on submit with user having lesser balance then total donation", async () => {
      const cart: CartProject[] = [makeApprovedProjectData()];

      renderWrapped();

      /* Set donation amount on one project */
      const projectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${cart[0].projectMetadata.title}`,
      });
      fireEvent.change(projectDonationInput, {
        target: {
          value: "100",
        },
      });

      /* Click on Confirm Button */
      const confirmButton = screen.getByTestId("handle-confirmation");
      fireEvent.click(confirmButton);

      expect(
        await screen.queryByTestId("insufficientBalance")
      ).toBeInTheDocument();
      expect(await screen.queryByTestId("emptyInput")).not.toBeInTheDocument();
      expect(
        await screen.queryByTestId("confirm-modal")
      ).not.toBeInTheDocument();
    });

    it("opens confirmation modal when user clicks on submit with sufficient balance and donation fields set", async () => {
      const cart: CartProject[] = [makeApprovedProjectData()];

      renderWrapped();

      /* Set donation amount on one project */
      const projectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${cart[0].projectMetadata.title}`,
      });
      fireEvent.change(projectDonationInput, {
        target: {
          value: "1",
        },
      });

      /* Click on Confirm Button */
      const confirmButton = screen.getByTestId("handle-confirmation");
      fireEvent.click(confirmButton);

      expect(
        await screen.queryByTestId("insufficientBalance")
      ).not.toBeInTheDocument();
      expect(await screen.queryByTestId("emptyInput")).not.toBeInTheDocument();
      expect(await screen.queryByTestId("confirm-modal")).toBeInTheDocument();
    });
  });

  it("apply to all and amount fields are visible", async () => {
    const useParamsFn = () => ({
      chainId,
      roundId,
    });

    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useParams: useParamsFn,
    }));

    renderWrapped();

    const amountInputField = screen.getByRole("spinbutton", {
      name: /donation amount for all projects/i,
    });
    expect(amountInputField).toBeInTheDocument();

    const applyAllButton = screen.getByRole("button", {
      name: /apply to all/i,
    });
    expect(applyAllButton).toBeInTheDocument();
  });

  it("applies the donation to all projects", function () {
    const cart: CartProject[] = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];

    renderWrapped();

    const amountInputField = screen.getByRole("spinbutton", {
      name: /donation amount for all projects/i,
    });

    const applyAllButton = screen.getByRole("button", {
      name: /apply to all/i,
    });

    fireEvent.change(amountInputField, {
      target: {
        value: 100,
      },
    });
    fireEvent.click(applyAllButton);

    const projectDonationInput1 = screen.getByRole<HTMLInputElement>(
      "spinbutton",
      {
        name: `Donation amount for project ${cart[0].projectMetadata.title}`,
      }
    );
    const projectDonationInput2 = screen.getByRole<HTMLInputElement>(
      "spinbutton",
      {
        name: `Donation amount for project ${cart[1].projectMetadata.title}`,
      }
    );

    expect(projectDonationInput1.value).toBe("100");
    expect(projectDonationInput2.value).toBe("100");
  });

  it("shows payout token drop down", () => {
    renderWrapped();

    const PayoutTokenDropdown = screen.getByTestId("payout-token-select");
    expect(PayoutTokenDropdown).toBeInTheDocument();
  });

  it("renders a dropdown list of tokens when payout token input is clicked", async () => {
    const chainId = 5;

    const useParamsFn = () => ({
      chainId,
      roundId,
    });

    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useParams: useParamsFn,
    }));

    renderWrapped();

    const options = getVotingTokenOptions(chainId);

    const payoutTokenSelection = screen.getByTestId("payout-token-select");
    fireEvent.click(payoutTokenSelection);

    const selectOptions = await screen.findAllByTestId("payout-token-option");
    expect(selectOptions).toHaveLength(options.length);
  });
});

function renderWrapped() {
  render(
    <MemoryRouter>
      <RoundProvider>
        <ViewCart />
      </RoundProvider>
    </MemoryRouter>
  );
}
