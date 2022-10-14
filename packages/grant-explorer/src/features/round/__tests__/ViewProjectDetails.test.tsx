import {
  makeApprovedProjectData,
  makeRoundData,
  renderWithContext,
} from "../../../test-utils";
import { fireEvent, screen } from "@testing-library/react";
import ViewProjectDetails from "../ViewProjectDetails";
import { faker } from "@faker-js/faker";

const chainId = faker.datatype.number();
const roundId = faker.finance.ethereumAddress();
const grantApplicationId = "";
const useParamsFn = () => ({
  chainId,
  roundId,
  applicationId: grantApplicationId,
});

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
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

  it("shows project website", async () => {
    const expectedProject = makeApprovedProjectData({ grantApplicationId });
    const expectedProjectWebsite = expectedProject.projectMetadata.website;

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    expect(await screen.findByText(expectedProjectWebsite)).toBeInTheDocument();
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

  it("shows project twitter", async () => {
    const expectedProjectTwitter = `${faker.internet.userName()}`;
    const expectedProject = makeApprovedProjectData(
      { grantApplicationId },
      { projectTwitter: expectedProjectTwitter }
    );

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    expect(
      await screen.findByText(`@${expectedProjectTwitter}`)
    ).toHaveTextContent(expectedProjectTwitter);
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

  it("shows an add-to-ballot button", () => {
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    expect(screen.getByTestId("add-to-ballot")).toBeInTheDocument();
  });

  it("shows a remove-from-ballot button replacing add-to-ballot when add-to-ballot is clicked", () => {
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });
    const addToBallot = screen.getByTestId("add-to-ballot");
    fireEvent.click(addToBallot);

    expect(screen.getByTestId("remove-from-ballot")).toBeInTheDocument();
    expect(screen.queryByTestId("add-to-ballot")).not.toBeInTheDocument();
  });

  it("shows a add-to-ballot button replacing a remove-from-ballot button when remove-from-balled is clicked", () => {
    renderWithContext(<ViewProjectDetails />, { rounds: [roundWithProjects] });

    // click add to ballot
    const addToBallot = screen.getByTestId("add-to-ballot");
    fireEvent.click(addToBallot);

    expect(screen.getByTestId("remove-from-ballot")).toBeInTheDocument();
    expect(screen.queryByTestId("add-to-ballot")).not.toBeInTheDocument();

    // click remove from ballot
    const removeFromBallot = screen.getByTestId("remove-from-ballot");
    fireEvent.click(removeFromBallot);

    expect(screen.getByTestId("add-to-ballot")).toBeInTheDocument();
    expect(screen.queryByTestId("remove-from-ballot")).not.toBeInTheDocument();
  })
});
