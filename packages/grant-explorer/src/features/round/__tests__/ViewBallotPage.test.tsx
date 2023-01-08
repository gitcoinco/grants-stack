import ViewBallot from "../ViewBallotPage";
import { fireEvent, render, screen } from "@testing-library/react";
import { BallotContext } from "../../../context/BallotContext";
import { Project } from "../../api/types";
import { makeApprovedProjectData, mockBalance, mockNetwork, mockSigner } from "../../../test-utils";
import { RoundProvider } from "../../../context/RoundContext";
import { faker } from "@faker-js/faker";
import { MemoryRouter } from "react-router-dom";
import { getPayoutTokenOptions } from "../../api/utils";
import { BigNumber, ethers } from "ethers";

const chainId = 5;
const roundId = faker.finance.ethereumAddress();
const userAddress = faker.finance.ethereumAddress();

const mockAccount = {
  address: userAddress,
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

describe("View Ballot Page", () => {
  describe("Shortlist", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows list of projects with project name", () => {
      const shortlist: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      renderWrapped(shortlist);

      const projects = screen.getAllByTestId("project");
      expect(projects.length).toEqual(shortlist.length);
      projects.forEach((project, i) => {
        expect(project.textContent).toContain(
          shortlist[i].projectMetadata.title
        );
        expect(project.textContent).toContain(
          shortlist[i].projectMetadata.description
        );
      });
    });

    it("shows message that you have no projects", () => {
      renderWrapped();

      screen.getByText(
        /Projects that you add to the Shortlist will appear here./i
      );
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

      const options = getPayoutTokenOptions(chainId.toString());

      const payoutTokenSelection = screen.getByTestId("payout-token-select");
      fireEvent.click(payoutTokenSelection);

      const selectOptions = await screen.findAllByTestId("payout-token-option");
      expect(selectOptions).toHaveLength(options.length);
    });

    it("shows trash button to remove project", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      renderWrapped(shortlist);

      const trashButton = screen.getByTestId("remove-from-shortlist");
      expect(trashButton).toBeInTheDocument();
    });

    it("calls setShortlist action when trash button is clicked", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      const removeFromShortlist = screen.getAllByTestId(
        "remove-from-shortlist"
      )[0];
      fireEvent.click(removeFromShortlist);

      expect(setShortlist).toHaveBeenCalled();
    });

    it("shows default select button in grey state", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      const SelectButton = screen.getByText("Select");
      expect(SelectButton.classList).toContain("bg-grey-150");
    });

    it("select button turns violet when clicked", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      const SelectButton = screen.getByText("Select");
      fireEvent.click(SelectButton);
      const SelectButtonAfterClick = screen.getByTestId("select");
      expect(SelectButtonAfterClick.classList).toContain("bg-violet-400");
    });

    it("active selected button turns grey when clicked", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      const SelectButton = screen.getByText("Select");
      fireEvent.click(SelectButton);
      fireEvent.click(SelectButton);
      expect(SelectButton.classList).toContain("bg-grey-150");
    });

    it("selecting project from shortlist adds to selected state", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      /* Enable selection mode */
      const SelectButton = screen.getByText("Select");
      fireEvent.click(SelectButton);

      /* Click the first project */
      const FirstProject = screen.getAllByTestId("project")[0];
      fireEvent.click(FirstProject);

      expect(
        screen.getAllByTestId("project")[0].firstElementChild!.classList
      ).toContain("bg-violet-100");
    });

    it("unselecting project from shortlist removes from selected count", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      /* Enable selection mode */
      const SelectButton = screen.getByText("Select");
      fireEvent.click(SelectButton);

      /* Click the first project */
      const FirstProject = screen.getAllByTestId("project")[0];
      fireEvent.click(FirstProject);

      expect(screen.getByTestId("select")).toHaveTextContent(
        "Add selected (1) to Final Donation"
      );

      /* Click the first project again to deselect it */
      fireEvent.click(screen.getAllByTestId("project")[0]);

      expect(screen.getByText("Select")).toBeInTheDocument();
    });

    it("selecting project turns background to violet", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      /* Enable selection mode */
      const SelectButton = screen.getByText("Select");
      fireEvent.click(SelectButton);

      /* Click the first project */
      const FirstProject = screen.getAllByTestId("project")[0];
      fireEvent.click(FirstProject);

      expect(
        screen.getAllByTestId("project")[0].firstElementChild!.classList
      ).toContain("bg-violet-100");
    });
    it("unselecting project turns background to white", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      /* Enable selection mode */
      const SelectButton = screen.getByText("Select");
      fireEvent.click(SelectButton);

      /* Click the first project */
      const FirstProject = screen.getAllByTestId("project")[0];
      fireEvent.click(FirstProject);

      expect(
        screen.getAllByTestId("project")[0].firstElementChild!.classList
      ).toContain("bg-violet-100");

      fireEvent.click(screen.getAllByTestId("project")[0]);
      expect(
        screen.getAllByTestId("project")[0].firstElementChild!.classList
      ).not.toContain("bg-violet-100");
    });

    it("unselecting all projects from selected state turns select button grey", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();

      renderWrapped(shortlist, setShortlist);

      /* Enable selection mode */
      const SelectButton = screen.getByText("Select");
      fireEvent.click(SelectButton);

      /* Click the first project */
      const FirstProject = screen.getAllByTestId("project")[0];
      fireEvent.click(FirstProject);

      /* Click the first project again */
      fireEvent.click(screen.getAllByTestId("project")[0]);

      /* Select button should turn gray */
      expect(screen.getByText("Select").classList).toContain("bg-grey-150");
    });

    it("clicking on add to final donation moves project from shortlist to final donation", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();
      const setFinalBallot = jest.fn();

      renderWrapped(shortlist, setShortlist, [], setFinalBallot);

      /* Enable selection mode */
      const SelectButton = screen.getByText("Select");
      fireEvent.click(SelectButton);

      /* Click the first project */
      const FirstProject = screen.getAllByTestId("project")[0];
      fireEvent.click(FirstProject);

      /* Click on Select Button */
      const moveToButton = screen.getByTestId("move-to-finalBallot");
      fireEvent.click(moveToButton);

      expect(setShortlist).toHaveBeenCalled();
      expect(setFinalBallot).toHaveBeenCalled();
    });

    it("should contain a link element with each test id to redirect the user back to the project", () => {
      const shortlist: Project[] = [makeApprovedProjectData()];

      const setShortlist = jest.fn();
      const setFinalBallot = jest.fn();

      renderWrapped(shortlist, setShortlist, [], setFinalBallot);

      shortlist.map((project) => {
        const link = screen.getByTestId(
          `${project.projectRegistryId}-project-link`
        );
        expect(link).toBeInTheDocument();
      });
    });

    describe("Shortlist Bulk Actions", () => {
      const setShortlist = jest.fn();
      const setFinalBallot = jest.fn();

      it("should not display bulk operations on shortlist when no projects are present in the shortlist ", () => {
        renderWrapped([], setShortlist, [], setFinalBallot);

        expect(screen.queryByTestId("bulk-remove-from-shortlist")).toBeNull();
        expect(screen.queryByTestId("bulk-add-to-final-ballot")).toBeNull();
      });

      it("should display bulk operations on shortlist when projects are present in the shortlist", () => {
        const shortlist: Project[] = [makeApprovedProjectData()];

        renderWrapped(shortlist, setShortlist, [], setFinalBallot);

        expect(screen.queryByTestId("bulk-remove-from-shortlist")).toBeTruthy();
        expect(screen.queryByTestId("bulk-add-to-final-ballot")).toBeTruthy();
      });

      it("clicking on clear all button empties the shortlist", () => {
        const shortlist: Project[] = [makeApprovedProjectData()];
        renderWrapped(shortlist, setShortlist, [], setFinalBallot);

        const clearAll = screen.getByTestId("bulk-remove-from-shortlist");
        fireEvent.click(clearAll);

        expect(setShortlist).toHaveBeenCalled();
      });

      it("clicking on move all projects to final ballot button moves projects from shortlist to final ballot", () => {
        const shortlist: Project[] = [makeApprovedProjectData()];
        renderWrapped(shortlist, setShortlist, [], setFinalBallot);

        const bulkAdd = screen.getByTestId("bulk-add-to-final-ballot");
        fireEvent.click(bulkAdd);

        expect(setFinalBallot).toHaveBeenCalled();
        expect(setShortlist).toHaveBeenCalled();
      });
    });
  });

  describe("Final Ballot", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows list of projects with project name", () => {
      const finalBallot: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      renderWrapped([], () => {}, finalBallot);

      const projects = screen.getAllByTestId("finalBallot-project");
      expect(projects.length).toEqual(finalBallot.length);
      projects.forEach((project, i) => {
        expect(project.textContent).toContain(
          finalBallot[i].projectMetadata.title
        );
      });
    });

    it("shows message that you have no projects", () => {
      renderWrapped();

      screen.getByText(/Add the projects you want to fund here!/i);
    });

    it("moves project from final donation to shortlist when clicking the send back button", async () => {
      const finalBallot: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      const setShortlist = jest.fn();
      const setFinalBallot = jest.fn();

      renderWrapped([], setShortlist, finalBallot, setFinalBallot);

      // expect(screen.getAllByTestId("project").length).toEqual(0);
      expect(screen.getAllByTestId("finalBallot-project").length).toEqual(2);

      /* Click the first project */
      const removeProjectFromFinalBallot = screen.getAllByTestId(
        "remove-from-finalBallot"
      )[0];
      fireEvent.click(removeProjectFromFinalBallot);

      expect(setFinalBallot).toHaveBeenCalled();
      expect(setShortlist).toHaveBeenCalled();
    });
  });

  describe("Summary", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows default amount when you have no projects in final ballot", () => {
      renderWrapped();

      const totalDonation = screen.getByTestId("totalDonation");
      expect(totalDonation).toHaveTextContent("0");
    });

    it("reflects a change in donation to one project in the final contribution", () => {
      const finalBallot: Project[] = [makeApprovedProjectData()];

      renderWrapped([], () => {}, finalBallot);

      /* Set donation amount on one project */
      const projectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${finalBallot[0].projectMetadata.title}`,
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
      const finalBallot: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      renderWrapped([], () => {}, finalBallot);

      /* Set donation amount on one project */
      const projectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${finalBallot[0].projectMetadata.title}`,
      });
      fireEvent.change(projectDonationInput, {
        target: {
          value: "10",
        },
      });

      const secondProjectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${finalBallot[1].projectMetadata.title}`,
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
          name: `Donation amount for project ${finalBallot[1].projectMetadata.title}`,
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

      const options = getPayoutTokenOptions(chainId.toString());
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
      const finalBallot: Project[] = [makeApprovedProjectData()];

      renderWrapped([], () => {}, finalBallot);

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
      const finalBallot: Project[] = [makeApprovedProjectData()];

      renderWrapped([], () => {}, finalBallot);

      /* Set donation amount on one project */
      const projectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${finalBallot[0].projectMetadata.title}`,
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
      const finalBallot: Project[] = [makeApprovedProjectData()];

      renderWrapped([], () => {}, finalBallot);

      /* Set donation amount on one project */
      const projectDonationInput = screen.getByRole("spinbutton", {
        name: `Donation amount for project ${finalBallot[0].projectMetadata.title}`,
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
    const finalBallot: Project[] = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];

    const setShortlist = jest.fn();
    const setFinalBallot = jest.fn();

    renderWrapped([], setShortlist, finalBallot, setFinalBallot);

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
        name: `Donation amount for project ${finalBallot[0].projectMetadata.title}`,
      }
    );
    const projectDonationInput2 = screen.getByRole<HTMLInputElement>(
      "spinbutton",
      {
        name: `Donation amount for project ${finalBallot[1].projectMetadata.title}`,
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

    const options = getPayoutTokenOptions(chainId.toString());

    const payoutTokenSelection = screen.getByTestId("payout-token-select");
    fireEvent.click(payoutTokenSelection);

    const selectOptions = await screen.findAllByTestId("payout-token-option");
    expect(selectOptions).toHaveLength(options.length);
  });
});

function renderWrapped(
  shortlist: Project[] = [],
  setShortlist = () => {},
  finalBallot: Project[] = [],
  setFinalBallot = () => {}
) {
  render(
    <MemoryRouter>
      <RoundProvider>
        <BallotContext.Provider
          value={{
            shortlist: shortlist,
            setShortlist: setShortlist,
            finalBallot: finalBallot,
            setFinalBallot: setFinalBallot,
          }}
        >
          <ViewBallot />
        </BallotContext.Provider>
      </RoundProvider>
    </MemoryRouter>
  );
}
