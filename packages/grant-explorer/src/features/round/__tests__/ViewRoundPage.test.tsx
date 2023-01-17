import { enableFetchMocks } from "jest-fetch-mock";

enableFetchMocks();
fetchMock.mockIf(/summary/, JSON.stringify({}));

import ViewRound from "../ViewRoundPage";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  generateIpfsCid,
  makeApprovedProjectData,
  makeRoundData,
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import { faker } from "@faker-js/faker";
import { Project, Round } from "../../api/types";
import { payoutTokens } from "../../api/utils";
import { BigNumber, ethers } from "ethers";

const chainId = faker.datatype.number();
const roundId = faker.finance.ethereumAddress();
const useParamsFn = () => ({ chainId: chainId, roundId: roundId });
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

describe("<ViewRound /> in case of before the application start date", () => {
  let stubRound: Round;

  beforeEach(() => {
    jest.clearAllMocks();

    const applicationsStartTime = faker.date.soon();
    const applicationsEndTime = faker.date.future(1, applicationsStartTime);
    const roundStartTime = faker.date.soon(1, applicationsEndTime);
    const roundEndTime = faker.date.future(1, roundStartTime);
    const token = payoutTokens[0].address;
    stubRound = makeRoundData({
      id: roundId,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token: token,
    });
  });

  it("Should show grayed out Applications Open buttom", async () => {
    renderWithContext(<ViewRound/>, { rounds: [stubRound], isLoading: false });

    const AppSubmissionButton = screen.getByTestId("applications-open-button");
    expect(AppSubmissionButton).toBeInTheDocument();
    expect(AppSubmissionButton).toBeDisabled();
  });
});

describe("<ViewRound /> in case of during the application period", () => {
  let stubRound: Round;
  window.open = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const applicationsStartTime = faker.date.recent(); // recent past
    const applicationsEndTime = faker.date.soon();
    const roundStartTime = faker.date.future(1, applicationsEndTime);
    const roundEndTime = faker.date.soon(10, roundStartTime);
    const token = payoutTokens[0].address;
    stubRound = makeRoundData({
      id: roundId,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token: token,
    });
  });

  it("should display 404 when round is not found", () => {
    renderWithContext(<ViewRound/>, { rounds: [], isLoading: false });
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("should show the application view page", () => {
    // render the component
    renderWithContext(<ViewRound/>, { rounds: [stubRound], isLoading: false });

    // expect that components / text / dates / etc. specific to  application view page
    expect(screen.getByText(stubRound.roundMetadata!.name)).toBeInTheDocument();
    expect(screen.getByTestId("application-period")).toBeInTheDocument();
    expect(screen.getByTestId("round-period")).toBeInTheDocument();
    expect(screen.getByTestId("matching-funds")).toBeInTheDocument();
    expect(
      screen.getByText(stubRound.roundMetadata!.eligibility!.description)
    ).toBeInTheDocument();
    expect(screen.getByTestId("round-eligibility")).toBeInTheDocument();
  });

  it("Should show apply to round button", async () => {
    renderWithContext(<ViewRound/>, { rounds: [stubRound], isLoading: false });
    const appURL =
      "https://grantshub.gitcoin.co/#/chains/" + chainId + "/rounds/" + roundId;

    const AppSubmissionButton = await screen.findByText("Apply to Grant Round");
    expect(AppSubmissionButton).toBeInTheDocument();
    fireEvent.click(AppSubmissionButton);
    expect(window.open).toBeCalled();
    expect(window.open).toHaveBeenCalledWith(appURL, "_blank");
  });
});

describe("<ViewRound /> in case of post application end date & before round start date", () => {
  let stubRound: Round;

  beforeEach(() => {
    jest.clearAllMocks();

    const applicationsEndTime = faker.date.recent();
    const applicationsStartTime = faker.date.past(1, applicationsEndTime);
    const roundStartTime = faker.date.soon();
    const roundEndTime = faker.date.future(1, roundStartTime);
    const token = payoutTokens[0].address;
    stubRound = makeRoundData({
      id: roundId,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token: token,
    });
  });

  it("Should show Applications Closed button", async () => {
    renderWithContext(<ViewRound/>, { rounds: [stubRound], isLoading: false });

    const AppSubmissionButton = screen.getByTestId(
      "applications-closed-button"
    );
    expect(AppSubmissionButton).toBeInTheDocument();
    expect(AppSubmissionButton).toBeDisabled();
  });
});

describe("<ViewRound /> in case of after the round start date", () => {
  let stubRound: Round;
  const roundStartTime = faker.date.recent();
  const applicationsEndTime = faker.date.past(1, roundStartTime);
  const applicationsStartTime = faker.date.past(1, applicationsEndTime);
  const roundEndTime = faker.date.soon();
  const token = payoutTokens[0].address;

  beforeEach(() => {
    jest.clearAllMocks();
    stubRound = makeRoundData({
      id: roundId,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token: token,
    });
  });

  it("should display 404 when round is not found", () => {
    renderWithContext(<ViewRound/>, { rounds: [], isLoading: false });
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("displays the round name", async () => {
    renderWithContext(<ViewRound/>, { rounds: [stubRound] });

    await screen.findByText(stubRound.roundMetadata!.name);
  });

  it("displays a loading spinner if loading", () => {
    renderWithContext(<ViewRound/>, { isLoading: true });

    screen.getByTestId("loading-spinner");
  });

  it("displays the project details of an approved grant application", async () => {
    const expectedApprovedProject: Project = makeApprovedProjectData();
    const token = payoutTokens[0].address;

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedApprovedProject],
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound/>, { rounds: [roundWithProjects] });

    const ProjectTitle = await screen.getByTestId("project-title");
    const ProjectOwner = await screen.getByTestId("project-owner");
    const ProjectDescription = await screen.getByTestId("project-description");

    expect(ProjectTitle).toBeInTheDocument();
    expect(ProjectOwner).toBeInTheDocument();
    expect(ProjectDescription).toBeInTheDocument();
  });

  it("displays the project banner of an approved grant application if provided", async () => {
    const expectedApprovedProject: Project = makeApprovedProjectData(
      {},
      {
        bannerImg: generateIpfsCid(),
      }
    );
    const expectedBannerImg = expectedApprovedProject.projectMetadata.bannerImg;
    const token = payoutTokens[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedApprovedProject],
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound/>, { rounds: [roundWithProjects] });

    const actualBanner = screen.getAllByRole("img", {
      name: /project banner/i,
    })[0] as HTMLImageElement;
    expect(actualBanner.src).toContain(expectedBannerImg);
  });

  it("displays all approved projects in the round", () => {
    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    const token = payoutTokens[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound/>, { rounds: [roundWithProjects] });

    const projectCards = screen.getAllByTestId("project-card");
    expect(projectCards.length).toEqual(approvedProjects.length);
    approvedProjects.forEach((project) => {
      expect(
        screen.getByText(project.projectMetadata.title)
      ).toBeInTheDocument();
    });
  });

  it("links each project card to the project detail page", () => {
    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    const token = payoutTokens[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound/>, { rounds: [roundWithProjects] });

    const projectLinks = screen.getAllByTestId(
      "project-detail-link"
    ) as HTMLAnchorElement[];
    expect(projectLinks.length).toEqual(approvedProjects.length);

    const expectedProjectLinks = approvedProjects.map(
      (project) => `/round/${chainId}/${roundId}/${project.grantApplicationId}`
    );
    projectLinks.forEach((projectLink) => {
      const actualProjectLinkPathName = projectLink.pathname;
      expect(expectedProjectLinks).toContain(actualProjectLinkPathName);
    });
  });

  it("search filters projects by exact title matches first", async () => {
    const projectMetadata = {
      title: "gitcoin",
      description: "test",
      website: "test.com",
      owners: [],
    };
    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData({ projectMetadata }),
      makeApprovedProjectData({
        projectMetadata: { ...projectMetadata, title: "gitcoin pro" },
      }),
      makeApprovedProjectData({
        projectMetadata: { ...projectMetadata, title: "my great gitcoin" },
      }),
    ];
    const token = payoutTokens[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound/>, { rounds: [roundWithProjects] });

    const searchInput = screen.getByPlaceholderText("Search");
    const projectCards = screen.getAllByTestId("project-card");
    expect(projectCards.length).toEqual(approvedProjects.length);

    const searchQuery = "gitcoin";
    fireEvent.change(searchInput, { target: { value: searchQuery } });

    await waitFor(() => {
      const filteredProjectCards = screen.getAllByTestId("project-title");
      expect(filteredProjectCards.length).toEqual(3);
      expect(filteredProjectCards[0].textContent).toEqual(searchQuery);
    });
  });

  describe("add project to ballot", () => {
    const approvedProjects = [makeApprovedProjectData()];
    const token = payoutTokens[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    it("shows an add-to-shortlist button", () => {
      renderWithContext(<ViewRound/>, { rounds: [roundWithProjects] });

      expect(screen.getByTestId("add-to-shortlist")).toBeInTheDocument();
    });

    it("shows a remove-from-shortlist button replacing add-to-shortlist when add-to-shortlist is clicked", () => {
      renderWithContext(<ViewRound/>, { rounds: [roundWithProjects] });
      const addToBallot = screen.getByTestId("add-to-shortlist");
      fireEvent.click(addToBallot);
      setTimeout(() => {
        // wait three seconds after the user clicks add before proceeding
        expect(screen.getByTestId("remove-from-shortlist")).toBeInTheDocument();
        expect(
          screen.queryByTestId("add-to-shortlist")
        ).not.toBeInTheDocument();
      }, 3000);
    });

    it("shows a add-to-shortlist button replacing a remove-from-shortlist button when remove-from-balled is clicked", () => {
      renderWithContext(<ViewRound/>, { rounds: [roundWithProjects] });

      // click add to ballot
      const addToBallot = screen.getByTestId("add-to-shortlist");
      fireEvent.click(addToBallot);
      setTimeout(() => {
        // wait three seconds after the user clicks add before proceeding
        expect(screen.getByTestId("remove-from-shortlist")).toBeInTheDocument();
        expect(
          screen.queryByTestId("add-to-shortlist")
        ).not.toBeInTheDocument();
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
});
