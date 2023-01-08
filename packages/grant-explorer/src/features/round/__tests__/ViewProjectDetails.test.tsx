import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

import {
  makeApprovedProjectData,
  makeRoundData,
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import { fireEvent, screen } from "@testing-library/react";
import ViewProjectDetails from "../ViewProjectDetails";
import { faker } from "@faker-js/faker";
import { BigNumber, ethers } from "ethers";

const chainId = faker.datatype.number();
const roundId = faker.finance.ethereumAddress();
const grantApplicationId = "";
const useParamsFn = () => ({
  chainId,
  roundId,
  applicationId: grantApplicationId,
});
const userAddress = faker.finance.ethereumAddress();
const mockAccount = {
  address: userAddress,
};

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: useParamsFn,
}));

describe("<ViewProjectDetails/>", () => {
  it("shows project name", async () => {
    const expectedProject = makeApprovedProjectData({ grantApplicationId });
    const expectedProjectName = expectedProject.projectMetadata.title;

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    expect(await screen.findByText(expectedProjectName)).toBeInTheDocument();
  });

  describe("Show project details", () => {
    const expectedProject = makeApprovedProjectData({ grantApplicationId });
    const expectedProjectWebsite = expectedProject.projectMetadata.website;

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });

    beforeEach(() => {
      jest.clearAllMocks();
      renderWithContext(<ViewProjectDetails />, {
        rounds: [roundWithProjects],
      });
    });

    it("shows project recipient", async () => {
      expect(await screen.getByTestId("project-recipient")).toBeInTheDocument();
    });

    it("shows project website", async () => {
      expect(
        await screen.findByText(expectedProjectWebsite)
      ).toBeInTheDocument();
    });

    it("shows project twitter", async () => {
      expect(screen.getByTestId("project-twitter")).toBeInTheDocument();
    });

    it("shows project user github", async () => {
      expect(screen.getByTestId("user-github")).toBeInTheDocument();
    });

    it("shows project github", async () => {
      expect(screen.getByTestId("project-github")).toBeInTheDocument();
    });
  });

  it("shows project stats", async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        success: true,
        message:
          "/update/summary/project/1/0xdf75054cd67217aee44b4f9e4ebc651c00330938/0xd27E1a1a60eBc1B70f4Cae5265092C0f6eDc7F9d",
        data: {
          contributionCount: 546,
          uniqueContributors: 528,
          totalContributionsInUSD: 400,
          averageUSDContribution: 0.7,
          updatedAt: "2022-12-22T14:41:36.002Z",
        },
      })
    );
    const expectedProject = makeApprovedProjectData({ grantApplicationId });
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });
    /* Initially shows - when loading */
    expect(screen.getByText("$-")).toBeInTheDocument();
    /* Then when the data resolves, displays that */
    const contributorsCount = await screen.findByText("528");
    expect(contributorsCount).toBeInTheDocument();
  });

  it("shows project description", async () => {
    const expectedProject = makeApprovedProjectData({ grantApplicationId });
    const expectedProjectDescription =
      expectedProject.projectMetadata.description;

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    expect(
      await screen.findByText(expectedProjectDescription)
    ).toBeInTheDocument();
  });

  it("shows project banner", async () => {
    const expectedProjectBannerImg = "bannersrc";
    const expectedProject = makeApprovedProjectData(
      { grantApplicationId },
      { bannerImg: expectedProjectBannerImg }
    );

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    const bannerImg = screen.getByRole("img", {
      name: /project banner/i,
    }) as HTMLImageElement;

    expect(bannerImg.src).toContain(expectedProjectBannerImg);
  });

  it("shows project logo", async () => {
    const expectedProjectLogoImg = "logosrc";
    const expectedProject = makeApprovedProjectData(
      { grantApplicationId },
      { logoImg: expectedProjectLogoImg }
    );

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    const logoImg = screen.getByRole("img", {
      name: /project logo/i,
    }) as HTMLImageElement;

    expect(logoImg.src).toContain(expectedProjectLogoImg);
  });
});

describe("voting ballot", () => {
  const expectedProject = makeApprovedProjectData({ grantApplicationId });
  const roundWithProjects = makeRoundData({
    id: roundId,
    approvedProjects: [expectedProject],
  });

  it("shows an add-to-shortlist button", () => {
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    expect(screen.getByTestId("add-to-shortlist")).toBeInTheDocument();
  });

  it("shows a remove-from-shortlist button replacing add-to-shortlist when add-to-shortlist is clicked", () => {
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });
    const addToBallot = screen.getByTestId("add-to-shortlist");
    fireEvent.click(addToBallot);
    setTimeout(() => {
      // wait three seconds after the user clicks add before proceeding
      expect(screen.getByTestId("remove-from-shortlist")).toBeInTheDocument();
      expect(screen.queryByTestId("add-to-shortlist")).not.toBeInTheDocument();
    }, 3000);
  });

  it("shows a add-to-shortlist button replacing a remove-from-shortlist button when remove-from-balled is clicked", () => {
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    // click add to ballot
    const addToBallot = screen.getByTestId("add-to-shortlist");
    fireEvent.click(addToBallot);
    setTimeout(() => {
      // wait three seconds after the user clicks add before proceeding
      expect(screen.getByTestId("remove-from-shortlist")).toBeInTheDocument();
      expect(screen.queryByTestId("add-to-shortlist")).not.toBeInTheDocument();
      // click remove from ballot
      const removeFromBallot = screen.getByTestId("remove-from-shortlist");
      fireEvent.click(removeFromBallot);
      expect(screen.getByTestId("add-to-shortlist")).toBeInTheDocument();
      expect(
        screen.queryByTestId("remove-from-shortlist")
      ).not.toBeInTheDocument();
    }, 3000);
  });
});
