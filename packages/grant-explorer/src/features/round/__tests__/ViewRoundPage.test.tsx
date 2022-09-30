import ViewRound from "../ViewRoundPage";
import { screen } from "@testing-library/react";
import { makeRoundData, renderWithContext } from "../../../test-utils";
import { faker } from "@faker-js/faker";
import { ApplicationStatus, Project, Round } from "../../api/types";

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
    const expectedProjectName = "my project";
    const expectedApprovedProject: Project = {
      grantApplicationId: "grant-application-id",
      projectRegistryId: "project-registry-id",
      projectMetadata: {
        title: expectedProjectName
      },
      status: ApplicationStatus.APPROVED
    };
    const roundWithProjects = makeRoundData({id: roundId, approvedProjects: [expectedApprovedProject]})
    renderWithContext(<ViewRound />, { rounds: [roundWithProjects] });

    await screen.findByText(expectedProjectName);
  })
});
