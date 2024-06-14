import ViewRound from "../ViewRoundPage";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  generateIpfsCid,
  makeApprovedProjectData,
  makeRoundData,
  renderWithContext,
} from "../../../test-utils";
import { faker } from "@faker-js/faker";
import { Project, Round } from "../../api/types";
import { vi } from "vitest";
import { parseUnits, zeroAddress } from "viem";
import { DataLayer } from "data-layer";
import { getTokensByChainId } from "common";

fetchMock.mockIf(/summary/, JSON.stringify({}));

const roundId = "1";

vi.mock("common", async () => {
  const actual = await vi.importActual<typeof import("common")>("common");
  return {
    ...actual,
    renderToPlainText: vi.fn().mockReturnValue(""),
  };
});
vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");
vi.mock("../../api/utils", async () => {
  const actual =
    await vi.importActual<typeof import("../../api/utils")>("../../api/utils");
  return {
    ...actual,
  };
});

vi.mock("wagmi", async () => {
  const actual = await vi.importActual<typeof import("wagmi")>("wagmi");
  return {
    ...actual,
    useAccount: () => ({
      address: zeroAddress,
    }),
    useBalance: () => ({
      data: {
        value: parseUnits("10", 18),
      },
    }),
    useSigner: () => ({ data: {} }),
    useNetwork: () => ({
      chain: { id: 10, name: "Optimism" },
      chains: [{ id: 10, name: "Optimism" }],
    }),
    useSwitchNetwork: () => ({
      chainId: 10,
    }),
    useToken: () => ({
      data: { symbol: "TEST" },
    }),
  };
});

vi.mock("react-router-dom", async () => {
  const useParamsFn = () => ({
    chainId: 10,
    roundId: "1",
  });
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );
  return {
    ...actual,
    useParams: useParamsFn,
  };
});

const mockDataLayer = {
  getRoundForExplorer: vi.fn().mockResolvedValue({
    rounds: [],
  }),
} as unknown as DataLayer;

describe("<ViewRound /> in case of before the application start date", () => {
  let stubRound: Round;

  beforeEach(() => {
    vi.clearAllMocks();

    const applicationsStartTime = faker.date.soon();
    const applicationsEndTime = faker.date.future(1, applicationsStartTime);
    const roundStartTime = faker.date.soon(1, applicationsEndTime);
    const roundEndTime = faker.date.future(1, roundStartTime);
    const token = getTokensByChainId(10)[0].address;
    stubRound = makeRoundData({
      id: roundId,
      chainId: 10,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token: token,
    });
  });

  it("Should show View Requirements Button", async () => {
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [stubRound], isLoading: false },
      dataLayer: mockDataLayer,
    });

    const AppSubmissionButton = screen.getByTestId("view-requirements-button");
    expect(AppSubmissionButton).toBeInTheDocument();
  });
});

describe("<ViewRound /> in case of during the application period", () => {
  let stubRound: Round;
  window.open = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const applicationsStartTime = faker.date.recent(); // recent past
    const applicationsEndTime = faker.date.soon();
    const roundStartTime = faker.date.future(1, applicationsEndTime);
    const roundEndTime = faker.date.soon(10, roundStartTime);
    const token = getTokensByChainId(10)[0].address;
    stubRound = makeRoundData({
      id: roundId,
      chainId: 10,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token: token,
    });
  });

  it("should display 404 when round is not found", () => {
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [], isLoading: false },
      dataLayer: mockDataLayer,
    });
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("should show the application view page", () => {
    // render the component
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [stubRound], isLoading: false },
      dataLayer: mockDataLayer,
    });

    // expect that components / text / dates / etc. specific to  application view page
    expect(screen.getAllByText(stubRound.roundMetadata!.name)).toHaveLength(2);
    expect(screen.getByTestId("application-period")).toBeInTheDocument();
    expect(screen.getByTestId("round-period")).toBeInTheDocument();
    expect(screen.getByTestId("matching-funds")).toBeInTheDocument();
    expect(
      screen.getByText(stubRound.roundMetadata!.eligibility!.description)
    ).toBeInTheDocument();
  });

  it("Should show apply to round button", async () => {
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [stubRound], isLoading: false },
      dataLayer: mockDataLayer,
    });
    const AppSubmissionButton = await screen.findAllByText("Apply now!");
    expect(AppSubmissionButton[0]).toBeInTheDocument();
  });
});

describe("<ViewRound /> in case of post application end date & before round start date", () => {
  let stubRound: Round;

  beforeEach(() => {
    vi.clearAllMocks();

    const applicationsEndTime = faker.date.recent();
    const applicationsStartTime = faker.date.past(1, applicationsEndTime);
    const roundStartTime = faker.date.soon();
    const roundEndTime = faker.date.future(1, roundStartTime);
    const token = getTokensByChainId(10)[0].address;
    stubRound = makeRoundData({
      id: roundId,
      chainId: 10,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token: token,
    });
  });

  it("Should show Donations countdown badge", async () => {
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [stubRound], isLoading: false },
      dataLayer: mockDataLayer,
    });
    const DonationsBadge = await screen.getByTestId(
      "donations-countdown-badge"
    );
    expect(DonationsBadge).toBeInTheDocument();
  });
});

describe("<ViewRound /> in case of after the round start date", () => {
  let stubRound: Round;
  const roundStartTime = faker.date.recent();
  const applicationsEndTime = faker.date.past(1, roundStartTime);
  const applicationsStartTime = faker.date.past(1, applicationsEndTime);
  const roundEndTime = faker.date.soon();
  const token = getTokensByChainId(10)[0].address;

  beforeEach(() => {
    vi.clearAllMocks();
    stubRound = makeRoundData({
      id: roundId,
      chainId: 10,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token: token,
    });
  });

  it("should display 404 when round is not found", () => {
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [], isLoading: false },
      dataLayer: mockDataLayer,
    });
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("displays the round name", async () => {
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [stubRound], isLoading: false },
      dataLayer: mockDataLayer,
    });

    expect(await screen.findByTestId("round-title")).toBeInTheDocument();
  });

  it("displays the bread crumbs", async () => {
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [stubRound], isLoading: false },
      dataLayer: mockDataLayer,
    });

    expect(await screen.findByTestId("bread-crumbs")).toBeInTheDocument();
  });

  it("displays a loading spinner if loading", () => {
    renderWithContext(<ViewRound />, {
      roundState: { isLoading: true },
      dataLayer: mockDataLayer,
    });

    screen.getByTestId("loading-spinner");
  });

  it("displays the project details of an approved grant application", async () => {
    const expectedApprovedProject: Project = makeApprovedProjectData();
    const token = getTokensByChainId(10)[0].address;

    const roundWithProjects = makeRoundData({
      id: roundId,
      chainId: 10,
      approvedProjects: [expectedApprovedProject],
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound />, {
      roundState: {
        rounds: [roundWithProjects],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

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
    const token = getTokensByChainId(10)[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      chainId: 10,
      approvedProjects: [expectedApprovedProject],
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound />, {
      roundState: {
        rounds: [roundWithProjects],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

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
    const token = getTokensByChainId(10)[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      chainId: 10,
      approvedProjects,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound />, {
      roundState: {
        rounds: [roundWithProjects],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

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
    const token = getTokensByChainId(10)[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      chainId: 10,
      approvedProjects,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound />, {
      roundState: {
        rounds: [roundWithProjects],
        isLoading: false,
      },
    });

    const projectLinks = screen.getAllByTestId(
      "project-detail-link"
    ) as HTMLAnchorElement[];
    expect(projectLinks.length).toEqual(approvedProjects.length);

    const expectedProjectLinks = approvedProjects.map(
      (project) => `/round/${10}/${roundId}/${project.grantApplicationId}`
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
      createdAt: 0,
      lastUpdated: 0,
      credentials: {},
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
    const token = getTokensByChainId(10)[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      chainId: 10,
      approvedProjects,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    renderWithContext(<ViewRound />, {
      roundState: {
        rounds: [roundWithProjects],
        isLoading: false,
      },
    });

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

  describe("add project to cart", () => {
    const approvedProjects = [makeApprovedProjectData()];
    const token = getTokensByChainId(10)[0].address;
    const roundWithProjects = makeRoundData({
      id: roundId,
      chainId: 10,
      approvedProjects,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
    });

    it("shows an add-to-cart button", () => {
      renderWithContext(<ViewRound />, {
        roundState: {
          rounds: [roundWithProjects],
          isLoading: false,
        },
      });

      expect(screen.getByTestId("add-to-cart")).toBeInTheDocument();
    });

    it("shows a remove-from-cart button replacing add-to-cart when add-to-cart is clicked", () => {
      renderWithContext(<ViewRound />, {
        roundState: {
          rounds: [roundWithProjects],
          isLoading: false,
        },
      });
      const addToCart = screen.getByTestId("add-to-cart");
      fireEvent.click(addToCart);
      setTimeout(() => {
        // wait three seconds after the user clicks add before proceeding
        expect(screen.getByTestId("remove-from-cart")).toBeInTheDocument();
        expect(screen.queryByTestId("add-to-cart")).not.toBeInTheDocument();
      }, 3000);
    });

    it("shows a add-to-cart button replacing a remove-from-cart button when remove-from-cart is clicked", () => {
      renderWithContext(<ViewRound />, {
        roundState: {
          rounds: [
            {
              ...roundWithProjects,
              approvedProjects: [makeApprovedProjectData()],
            },
          ],
          isLoading: false,
        },
      });
      // click add to cart
      const addToCart = screen.getByTestId("add-to-cart");
      fireEvent.click(addToCart);
      setTimeout(() => {
        // wait three seconds after the user clicks add before proceeding
        expect(screen.getByTestId("remove-from-cart")).toBeInTheDocument();
        expect(screen.queryByTestId("add-to-cart")).not.toBeInTheDocument();
        // click remove from cart
        const removeFromCart = screen.getByTestId("remove-from-cart");
        fireEvent.click(removeFromCart);
        expect(screen.getByTestId("add-to-cart")).toBeInTheDocument();
        expect(
          screen.queryByTestId("remove-from-cart")
        ).not.toBeInTheDocument();
      }, 3000);
    });
  });
});

describe("<ViewRound /> in case ApplicationsEnd and RoundEnd dates are not set", () => {
  let stubRound: Round;

  beforeEach(() => {
    vi.clearAllMocks();

    const applicationsEndTime = new Date("foo");
    const applicationsStartTime = faker.date.past();
    const roundStartTime = faker.date.soon();
    const roundEndTime = new Date("foo");
    stubRound = makeRoundData({
      id: roundId,
      chainId: 10,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
    });
  });

  it("Should display 'No End Date' for Applications and Round end dates", async () => {
    renderWithContext(<ViewRound />, {
      roundState: { rounds: [stubRound], isLoading: false },
    });

    const AppSubmissionButton = await screen.findAllByText("No End Date");
    expect(AppSubmissionButton.length).toEqual(2);
  });
});
