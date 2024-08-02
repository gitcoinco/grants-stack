import { screen } from "@testing-library/react";
import { renderWithContext } from "../../../test-utils";
import ViewProject from "../ViewProject";
import { formatDateWithOrdinal } from "common";
import { useProject } from "../hooks/useProject";
import { beforeEach, expect, Mock } from "vitest";
import { DataLayer, v2Project } from "data-layer";
import { mock } from "@wagmi/core";

vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");

vi.mock("@rainbow-me/rainbowkit", async () => {
  const actual = await vi.importActual<typeof import("@rainbow-me/rainbowkit")>(
    "@rainbow-me/rainbowkit"
  );
  return {
    ...actual,
    ConnectButton: vi.fn(),
    getDefaultConfig: vi.fn().mockReturnValue({}),
  };
});

vi.mock("common", async () => {
  const actual = await vi.importActual<typeof import("common")>("common");
  return {
    ...actual,
    useParams: vi.fn().mockImplementation(() => ({
      projectId: "0xdeadbeef-0xdeadbeef",
    })),
    useValidateCredential: vi.fn().mockReturnValue({ isValid: false }),
    useAllo: vi.fn().mockReturnValue({ data: {} }),
  };
});

vi.mock("wagmi", async () => {
  const actual = await vi.importActual<typeof import("wagmi")>("wagmi");
  return {
    ...actual,
    useSigner: () => ({
      data: {},
    }),
    useSwitchChain: vi.fn().mockReturnValue({ data: "" }),
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
    useProject: vi.fn().mockReturnValue({ data: "", error: "" }),
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

type Project = {
  project: v2Project;
};

const expectedProject: Project = {
  project: {
    id: "0xdeadbeef-0xdeadbeef",
    chainId: 1,
    metadata: {
      protocol: 1,
      pointer: "0xdeadbeefdeadbeef",
      id: "0xdeadbeeef",
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
  },
};

const mockDataLayer = {
  getRoundForExplorer: vi.fn().mockResolvedValue({
    rounds: [],
  }),
} as unknown as DataLayer;

describe("<ViewProject/>", () => {
  beforeEach(() => {
    (useProject as Mock).mockReturnValue({
      data: expectedProject,
      error: undefined,
    });
  });

  it("shows project name", async () => {
    renderWithContext(<ViewProject />, {
      dataLayer: mockDataLayer,
    });
    expect(
      await screen.findByRole("heading", {
        name: expectedProject.project.metadata.title,
      })
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
    renderWithContext(<ViewProject />, {
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

    expect(bannerImg.src).toContain(expectedProject.project.metadata.bannerImg);
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

    expect(logoImg.src).toContain(expectedProject.project.metadata.logoImg);
  });
});
