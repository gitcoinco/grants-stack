import ViewRound from "../ViewRoundPage";
import { screen } from "@testing-library/react";
import {
  generateIpfsCid,
  makeApprovedProjectData,
  makeRoundData,
  renderWithContext,
} from "../../../test-utils"
import { faker } from "@faker-js/faker";
import { Project, Round } from "../../api/types";

const chainId = faker.datatype.number();
const roundId = faker.finance.ethereumAddress();
const useParamsFn = () => ({ chainId: chainId, roundId: roundId });

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: useParamsFn,
}));

describe("<ViewRound /> in case of before the round start date", () => {
  let stubRound: Round;

  beforeEach(() => {
    jest.clearAllMocks();

    const applicationsStartTime = faker.date.recent(); // recent past
    const applicationsEndTime = faker.date.soon(10, applicationsStartTime);
    const roundStartTime = faker.date.future(1, applicationsEndTime);
    const roundEndTime = faker.date.soon(10, roundStartTime);
    stubRound = makeRoundData({ id: roundId, applicationsStartTime, applicationsEndTime, roundStartTime, roundEndTime });
  });

  it("should display 404 when round is not found", () => {
    renderWithContext(<ViewRound />, { rounds: [], isLoading: false });
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("should show the application view page", () => {
    // render the component
    renderWithContext(<ViewRound />, { rounds: [stubRound], isLoading: false });

    // expect that components / text / dates / etc. specific to  application view page
    expect(screen.getByText(stubRound.roundMetadata!.name)).toBeInTheDocument();
    expect(screen.getByTestId("application-period")).toBeInTheDocument();
    expect(screen.getByTestId("round-period")).toBeInTheDocument();
    expect(screen.getByText(stubRound.roundMetadata!.eligibility!.description)).toBeInTheDocument();
    expect(screen.getByTestId("round-eligibility")).toBeInTheDocument();
  });

});

describe("<ViewRound /> in case of after the round start date", () => {
  let stubRound: Round;

  beforeEach(() => {
    jest.clearAllMocks();

    const applicationsStartTime = faker.date.past(1); 
    const applicationsEndTime = faker.date.past(1, applicationsStartTime);
    const roundStartTime = faker.date.recent();
    const roundEndTime = faker.date.soon(10, roundStartTime);
    stubRound = makeRoundData({ id: roundId, applicationsStartTime, applicationsEndTime, roundStartTime, roundEndTime });
  });

  it("should display 404 when round is not found", () => {
    renderWithContext(<ViewRound />, { rounds: [], isLoading: false });
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("displays the round name", async () => {
    renderWithContext(<ViewRound />, { rounds: [stubRound] });

    await screen.findByText(stubRound.roundMetadata!.name);
  });

  it("displays a loading spinner if loading", () => {
    renderWithContext(<ViewRound />, { isLoading: true });

    screen.getByTestId("loading-spinner");
  });

  it("displays the project name of an approved grant application", async () => {
    const expectedApprovedProject: Project = makeApprovedProjectData();
    const expectedProjectName = expectedApprovedProject.projectMetadata.title;
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedApprovedProject],
    });

    renderWithContext(<ViewRound />, { rounds: [roundWithProjects] });

    await screen.findByText(expectedProjectName);
  });

  it("displays the project banner of an approved grant application if provided", async () => {
    const expectedApprovedProject: Project = makeApprovedProjectData(
      {},
      {
        bannerImg: generateIpfsCid(),
      }
    );
    const expectedBannerImg = expectedApprovedProject.projectMetadata.bannerImg;
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedApprovedProject],
    });

    renderWithContext(<ViewRound />, { rounds: [roundWithProjects] });

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
    const roundWithProjects = makeRoundData({ id: roundId, approvedProjects });

    renderWithContext(<ViewRound />, { rounds: [roundWithProjects] });

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
    const roundWithProjects = makeRoundData({ id: roundId, approvedProjects });

    renderWithContext(<ViewRound />, { rounds: [roundWithProjects] });

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
});


