import ViewRound from "../ViewRoundPage";
import { screen } from "@testing-library/react";
import { makeApprovedProjectData, makeRoundData, renderWithContext } from "../../../test-utils"
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

describe("<ViewRound />", () => {
  let stubRound: Round;

  beforeEach(() => {
    jest.clearAllMocks();

    stubRound = makeRoundData({id: roundId});
  });

  it("should display 404 when round is not found", () => {
    renderWithContext(<ViewRound />, { rounds: [], isLoading: false });
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("displays the round name", async () => {
    renderWithContext(<ViewRound />, { rounds: [stubRound] });

    await screen.findByText(stubRound.roundMetadata!.name);
  });

  it("displays program address", async () => {
    renderWithContext(<ViewRound />, { rounds: [stubRound] });

    await screen.findByText(stubRound.ownedBy);
  });

  it("displays a loading spinner if loading", () => {
    renderWithContext(<ViewRound />, { isLoading: true });

    screen.getByTestId("loading-spinner");
  });

  it("displays the project name of an approved grant application", async () => {
    const expectedApprovedProject: Project = makeApprovedProjectData();
    const expectedProjectName = expectedApprovedProject.projectMetadata.title;
    const roundWithProjects = makeRoundData({id: roundId, approvedProjects: [expectedApprovedProject]})

    renderWithContext(<ViewRound />, { rounds: [roundWithProjects] });

    await screen.findByText(expectedProjectName);
  })

  it("displays the project banner of an approved grant application", async () => {
    const expectedApprovedProject: Project = makeApprovedProjectData();
    const expectedBannerImg = expectedApprovedProject.projectMetadata.bannerImg;
    const roundWithProjects = makeRoundData({id: roundId, approvedProjects: [expectedApprovedProject]})

    renderWithContext(<ViewRound />, { rounds: [roundWithProjects] });

    const actualBanner = screen.getAllByRole("img", {
      name: /project banner/i,
    })[0] as HTMLImageElement;
    expect(actualBanner.src).toContain(expectedBannerImg);
  })

  it("displays all approved projects in the round", () => {
    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData()
    ];
    const roundWithProjects = makeRoundData({id: roundId, approvedProjects })

    renderWithContext(<ViewRound />, { rounds: [roundWithProjects] });

    const projectCards = screen.getAllByTestId("project-card");
    expect(projectCards.length).toEqual(approvedProjects.length);
    approvedProjects.forEach((project) => {
      expect(screen.getByText(project.projectMetadata.title)).toBeInTheDocument()
    })
  })
});
