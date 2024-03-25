import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import {
  renderComponentsBasedOnDeviceSize,
  renderWithContext,
  setWindowDimensions,
} from "../../../test-utils";
import ViewProjectDetails from "../ViewProjectDetails";
import { truncate } from "../../common/utils/truncate";
import { formatDateWithOrdinal } from "common";
import { useApplication } from "../../projects/hooks/useApplication";
import { beforeEach, expect, Mock } from "vitest";
import { Application, DataLayer } from "data-layer";

vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

vi.mock("common", async () => {
  const actual = await vi.importActual<typeof import("common")>("common");
  return {
    ...actual,
    useParams: vi.fn().mockImplementation(() => ({
      chainId: 1,
      roundId: "0x0",
      applicationId: "0xdeadbeef-0xdeadbeef",
    })),
  };
});

vi.mock("wagmi", async () => {
  const actual = await vi.importActual<typeof import("wagmi")>("wagmi");
  return {
    ...actual,
    useSigner: () => ({
      data: {},
    }),
    useEnsName: vi.fn().mockReturnValue({ data: "" }),
    useAccount: vi.fn().mockReturnValue({ data: "mockedAccount" }),
  };
});

vi.mock("../../projects/hooks/useApplication", async () => {
  const actual = await vi.importActual<
    typeof import("../../projects/hooks/useApplication")
  >("../../projects/hooks/useApplication");

  return {
    ...actual,
    useApplication: vi.fn().mockReturnValue({ data: "" }),
  };
});

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );

  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn().mockImplementation(() => ({
      chainId: 1,
      roundId: "0x0",
      applicationId: "0xdeadbeef-0xdeadbeef",
    })),
  };
});

const expectedProject: Application = {
  uniqueDonorsCount: 0,
  chainId: "1",
  id: faker.finance.ethereumAddress(),
  metadata: {
    application: {
      answers: [
        {
          answer: "never gonna give you up",
          hidden: false,
          question: "never gonna let you down",
          questionId: 0,
          type: "string",
        },
        {
          questionId: 1,
          question: "this is a hidden question",
          answer: "this will not show up",
          hidden: true,
        },
        {
          questionId: 2,
          question: "array of strings",
          answer: ["first option", "second option"],
          hidden: false,
        },
      ],
      recipient: faker.finance.ethereumAddress(),
    },
  },
  project: {
    id: faker.finance.ethereumAddress(),
    metadata: {
      createdAt: Date.now(),
      title: "Project test",
      description: "Best project in the world",
      website: "test.com",
      owners: [],
      bannerImg: "banner!",
      logoImg: "logo!",
      projectTwitter: "twitter.com/project",
      projectGithub: "github.com/project",
      userGithub: "github.com/user",
      lastUpdated: 0,
      credentials: {},
    },
  },
  projectId: faker.finance.ethereumAddress(),
  round: {
    strategyName: "allov1.QF",
    applicationsEndTime: new Date().valueOf().toString(),
    applicationsStartTime: new Date().valueOf().toString(),
    donationsEndTime: new Date().valueOf().toString(),
    donationsStartTime: new Date().valueOf().toString(),
    matchTokenAddress: faker.finance.ethereumAddress(),
    roundMetadata: {
      name: "",
      roundType: "public",
      eligibility: {
        description: "",
      },
      programContractAddress: "",
    },
    tags: [],
  },
  roundId: faker.finance.ethereumAddress(),
  status: "APPROVED",
  totalAmountDonatedInUsd: 0,
  totalDonationsCount: "0",
};

const mockDataLayer = {
  getRoundForExplorer: vi.fn().mockResolvedValue({
    rounds: [],
  }),
} as unknown as DataLayer;

describe("<ViewProjectDetails/>", () => {
  beforeEach(() => {
    (useApplication as Mock).mockReturnValue({
      data: expectedProject,
    });
  });

  it("shows project name", async () => {
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });
    expect(
      await screen.findByText(expectedProject.project.metadata.title)
    ).toBeInTheDocument();
  });

  describe("Show project details", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      renderWithContext(<ViewProjectDetails />, {
        roundState: {
          rounds: [],
          isLoading: false,
        },
        dataLayer: mockDataLayer,
      });
    });

    it("shows project recipient", async () => {
      expect(
        screen.getByText(
          truncate(expectedProject.metadata.application.recipient)
        )
      ).toBeInTheDocument();
    });

    it("shows project website", async () => {
      expect(
        await screen.findByText(expectedProject.project.metadata.website)
      ).toBeInTheDocument();
    });

    it("shows project twitter", async () => {
      expect(
        screen.getByText(
          expectedProject.project.metadata.projectTwitter as string
        )
      ).toBeInTheDocument();
    });

    it("shows created at date", async () => {
      expect(
        screen.getByText(
          formatDateWithOrdinal(
            new Date(expectedProject.project.metadata.createdAt as number)
          ),
          { exact: false }
        )
      ).toBeInTheDocument();
    });

    it("shows project user github", async () => {
      expect(
        screen.getByText(expectedProject.project.metadata.userGithub as string)
      ).toBeInTheDocument();
    });

    it("shows project github", async () => {
      expect(
        screen.getByText(
          expectedProject.project.metadata.projectGithub as string
        )
      ).toBeInTheDocument();
    });

    it("displays the bread crumbs", async () => {
      expect(await screen.findByTestId("bread-crumbs")).toBeInTheDocument();
    });
  });

  it("shows project description", async () => {
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    expect(
      await screen.findByText(expectedProject.project.metadata.description)
    ).toBeInTheDocument();
  });

  it("shows project banner", async () => {
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    const bannerImg = screen.getByRole("img", {
      name: /project banner/i,
    }) as HTMLImageElement;

    expect(bannerImg.src).toContain(expectedProject.project.metadata.bannerImg);
  });

  it("shows project logo", async () => {
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    const logoImg = screen.getByRole("img", {
      name: /project logo/i,
    }) as HTMLImageElement;

    expect(logoImg.src).toContain(expectedProject.project.metadata.logoImg);
  });

  it("shows project application form answers", async () => {
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    expect(screen.getByText("Additional Information")).toBeInTheDocument();

    expect(screen.getByText("never gonna give you up")).toBeInTheDocument();
    expect(screen.getByText("never gonna let you down")).toBeInTheDocument();

    expect(
      screen.queryByText("this is a hidden question")
    ).not.toBeInTheDocument();

    expect(screen.getByText("array of strings")).toBeInTheDocument();
    expect(screen.getByText("first option, second option")).toBeInTheDocument();
  });

  it("hides project application form answers when they're empty", async () => {
    (useApplication as Mock).mockImplementation(() => ({
      data: {
        ...expectedProject,
        metadata: {
          application: {
            answers: [],
          },
        },
      },
    }));
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    expect(
      screen.queryByText("Additional Information")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("this is a hidden question")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("this will not show up")).not.toBeInTheDocument();
  });
});

describe("voting cart", () => {
  beforeEach(() => {
    (useApplication as Mock).mockReturnValue({
      data: expectedProject,
    });
  });
  it("shows an add-to-cart button", async () => {
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });
    screen.logTestingPlaygroundURL();

    // mock screen size
    setWindowDimensions(320, 480);

    expect(renderComponentsBasedOnDeviceSize()).toBe("mobile");

    // click add to cart
    const addToCart = screen.getAllByTestId("add-to-cart");
    fireEvent.click(addToCart[0]);

    await act(async () => {
      await waitFor(
        () => {
          expect(
            screen.queryAllByTestId("remove-from-cart")[0]
          ).toBeInTheDocument();
          expect(screen.queryByTestId("add-to-cart")).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    const removeFromCart = screen.getAllByTestId("remove-from-cart");
    fireEvent.click(removeFromCart[0]);

    await act(async () => {
      await waitFor(
        () => {
          expect(screen.queryAllByTestId("add-to-cart")[0]).toBeInTheDocument();
          expect(
            screen.queryByTestId("remove-from-cart")
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  it("shows a remove-from-cart button replacing add-to-cart when add-to-cart is clicked", () => {
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });
    const addToCart = screen.getAllByTestId("add-to-cart");
    fireEvent.click(addToCart[0]);
    setTimeout(() => {
      // wait three seconds after the user clicks add before proceeding
      expect(screen.getByTestId("remove-from-cart")).toBeInTheDocument();
      expect(screen.queryByTestId("add-to-cart")).not.toBeInTheDocument();
    }, 3000);
  });

  it("shows a add-to-cart button replacing a remove-from-cart button when remove-from-cart is clicked", async () => {
    renderWithContext(<ViewProjectDetails />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    const removeFromCart = screen.getAllByTestId("remove-from-cart");
    fireEvent.click(removeFromCart[0]);

    await waitFor(
      () => {
        expect(screen.queryAllByTestId("add-to-cart")[0]).toBeInTheDocument();
        expect(
          screen.queryByTestId("remove-from-cart")
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
