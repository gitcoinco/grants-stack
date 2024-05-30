import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react";
import { renderWithContext } from "../../../test-utils";
import ViewProject from "../ViewProject";
import { formatDateWithOrdinal } from "common";
import { useApplication } from "../../projects/hooks/useApplication";
import { beforeEach, expect, Mock } from "vitest";
import { DataLayer, v2Project } from "data-layer";

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

vi.mock("../hooks/useProject", async () => {
  const actual = await vi.importActual<typeof import("../hooks/useProject")>(
    "../hooks/useProject"
  );

  return {
    ...actual,
    useProject: vi.fn().mockReturnValue({ data: "" }),
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
      projectId: "0xdeadbeef-0xdeadbeef",
    })),
  };
});

const expectedProject: v2Project = {
  id: faker.finance.ethereumAddress(),
  chainId: 1,
  metadata: {
    protocol: 1,
    pointer: "0xdeadbeefdeadbeef",
    id: "0xdeadbeef-0xdeadbeef",
    createdAt: Date.now(),
    title: "Project test",
    description: "Best project in the world",
    website: "test.com",
    bannerImg: "banner!",
    logoImg: "logo!",
    projectTwitter: "twitter.com/project",
    projectGithub: "github.com/project",
    userGithub: "github.com/user",
    credentials: {},
  },
  metadataCid: "0xdeadbeef",
  name: "Project test",
  nodeId: "0xdeadbeef",
  projectNumber: null,
  registryAddress: "",
  tags: [],
  createdByAddress: "",
  createdAtBlock: "",
  updatedAtBlock: "",
  roles: [],
  projectType: "CANONICAL",
};

const mockDataLayer = {
  getRoundForExplorer: vi.fn().mockResolvedValue({
    rounds: [],
  }),
} as unknown as DataLayer;

describe("<ViewProject/>", () => {
  beforeEach(() => {
    (useApplication as Mock).mockReturnValue({
      data: expectedProject,
    });
  });

  it("shows project name", async () => {
    renderWithContext(<ViewProject />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });
    expect(
      await screen.findByText(expectedProject.metadata.title)
    ).toBeInTheDocument();
  });

  describe("Show project details", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      renderWithContext(<ViewProject />, {
        roundState: {
          rounds: [],
          isLoading: false,
        },
        dataLayer: mockDataLayer,
      });
    });

    it("shows project website", async () => {
      expect(
        await screen.findByText(expectedProject.metadata.website)
      ).toBeInTheDocument();
    });

    it("shows project twitter", async () => {
      expect(
        screen.getByText(expectedProject.metadata.projectTwitter as string)
      ).toBeInTheDocument();
    });

    it("shows created at date", async () => {
      expect(
        screen.getByText(
          formatDateWithOrdinal(
            new Date(expectedProject.metadata.createdAt as number)
          ),
          { exact: false }
        )
      ).toBeInTheDocument();
    });

    it("shows project user github", async () => {
      expect(
        screen.getByText(expectedProject.metadata.userGithub as string)
      ).toBeInTheDocument();
    });

    it("shows project github", async () => {
      expect(
        screen.getByText(expectedProject.metadata.projectGithub as string)
      ).toBeInTheDocument();
    });

    it("displays the bread crumbs", async () => {
      expect(await screen.findByTestId("bread-crumbs")).toBeInTheDocument();
    });
  });

  it("shows project description", async () => {
    renderWithContext(<ViewProject />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    expect(
      await screen.findByText(expectedProject.metadata.description)
    ).toBeInTheDocument();
  });

  it("shows project banner", async () => {
    renderWithContext(<ViewProject />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    const bannerImg = screen.getByRole("img", {
      name: /project banner/i,
    }) as HTMLImageElement;

    expect(bannerImg.src).toContain(expectedProject.metadata.bannerImg);
  });

  it("shows project logo", async () => {
    renderWithContext(<ViewProject />, {
      roundState: {
        rounds: [],
        isLoading: false,
      },
      dataLayer: mockDataLayer,
    });

    const logoImg = screen.getByRole("img", {
      name: /project logo/i,
    }) as HTMLImageElement;

    expect(logoImg.src).toContain(expectedProject.metadata.logoImg);
  });
});
