import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { SWRConfig } from "swr";
import {
  makeApprovedProjectData,
  makeRoundData,
  renderComponentsBasedOnDeviceSize,
  renderWithContext,
  setWindowDimensions,
} from "../../../test-utils";
import ViewProjectDetails from "../ViewProjectDetails";

const chainId = faker.datatype.number();
const roundId = faker.finance.ethereumAddress();
const grantApplicationId = "0xdeadbeef-0xdeadbeef";

vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

vi.mock("wagmi", async () => {
  const actual = await vi.importActual("wagmi");
  return {
    ...actual,
    useSigner: () => ({
      data: {},
    }),
    useEnsName: vi.fn().mockReturnValue({ data: "" }),
    useAccount: vi.fn().mockReturnValue({ data: "mockedAccount" }),
  };
});
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({
      chainId,
      roundId,
      applicationId: grantApplicationId,
    }),
  };
});

describe("<ViewProjectDetails/>", () => {
  it("shows project name", async () => {
    const expectedProject = makeApprovedProjectData({ grantApplicationId });
    const expectedProjectName = expectedProject.projectMetadata.title;

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, {
      rounds: [roundWithProjects],
      isLoading: false,
    });

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
      vi.clearAllMocks();
      renderWithContext(<ViewProjectDetails />, {
        rounds: [roundWithProjects],
        isLoading: false,
      });
    });

    it("shows project recipient", async () => {
      expect(screen.getByTestId("project-recipient")).toBeInTheDocument();
    });

    it("shows project website", async () => {
      expect(
        await screen.findByText(expectedProjectWebsite)
      ).toBeInTheDocument();
    });

    it("shows project twitter", async () => {
      expect(screen.getByTestId("project-twitter")).toBeInTheDocument();
    });

    it("shows created at date", async () => {
      expect(screen.getByTestId("project-createdAt")).toBeInTheDocument();
    });

    it("shows project user github", async () => {
      expect(screen.getByTestId("user-github")).toBeInTheDocument();
    });

    it("shows project github", async () => {
      expect(screen.getByTestId("project-github")).toBeInTheDocument();
    });

    it("displays the bread crumbs", async () => {
      expect(await screen.findByTestId("bread-crumbs")).toBeInTheDocument();
    });
  });

  it("shows project stats", async () => {
    const expectedProject = makeApprovedProjectData({ grantApplicationId });
    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <ViewProjectDetails />
      </SWRConfig>,
      { rounds: [roundWithProjects], isLoading: false }
    );
    /* Initially shows - when loading */
    expect(screen.getAllByText("$-")[0]).toBeInTheDocument();
  });

  it("shows project description", async () => {
    const expectedProject = makeApprovedProjectData({ grantApplicationId });
    const expectedProjectDescription =
      expectedProject.projectMetadata.description;

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });
    renderWithContext(<ViewProjectDetails />, {
      rounds: [roundWithProjects],
      isLoading: false,
    });

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
    renderWithContext(<ViewProjectDetails />, {
      rounds: [roundWithProjects],
      isLoading: false,
    });

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
    renderWithContext(<ViewProjectDetails />, {
      rounds: [roundWithProjects],
      isLoading: false,
    });

    const logoImg = screen.getByRole("img", {
      name: /project logo/i,
    }) as HTMLImageElement;

    expect(logoImg.src).toContain(expectedProjectLogoImg);
  });

  it("shows project application form answers", async () => {
    const expectedProject = makeApprovedProjectData({
      grantApplicationId,
      grantApplicationFormAnswers: [
        {
          questionId: 0,
          question: "What is love?",
          answer: "baby don't hurt me",
          hidden: false,
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
    });

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });

    renderWithContext(<ViewProjectDetails />, {
      rounds: [roundWithProjects],
      isLoading: false,
    });

    expect(screen.getByText("Additional Information")).toBeInTheDocument();

    expect(screen.getByText("What is love?")).toBeInTheDocument();
    expect(screen.getByText("baby don't hurt me")).toBeInTheDocument();

    expect(
      screen.queryByText("this is a hidden question")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("this will not show up")).not.toBeInTheDocument();

    expect(screen.getByText("array of strings")).toBeInTheDocument();
    expect(screen.getByText("first option, second option")).toBeInTheDocument();
  });

  it("hides project application form answers when they're empty", async () => {
    const expectedProject = makeApprovedProjectData({
      grantApplicationId,
      grantApplicationFormAnswers: [
        {
          questionId: 1,
          question: "this is a hidden question",
          answer: "this will not show up",
          hidden: true,
        },
      ],
    });

    const roundWithProjects = makeRoundData({
      id: roundId,
      approvedProjects: [expectedProject],
    });

    renderWithContext(<ViewProjectDetails />, {
      rounds: [roundWithProjects],
      isLoading: false,
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
  const expectedProject = makeApprovedProjectData({ grantApplicationId });
  const roundWithProjects = makeRoundData({
    id: roundId,
    approvedProjects: [expectedProject],
  });

  it("shows an add-to-cart button", async () => {
    renderWithContext(<ViewProjectDetails />, {
      rounds: [roundWithProjects],
      isLoading: false,
    });

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
      rounds: [roundWithProjects],
      isLoading: false,
    });
    const addToCart = screen.getAllByTestId("add-to-cart");
    fireEvent.click(addToCart[0]);
    setTimeout(() => {
      // wait three seconds after the user clicks add before proceeding
      expect(screen.getByTestId("remove-from-cart")).toBeInTheDocument();
      expect(screen.queryByTestId("add-to-cart")).not.toBeInTheDocument();
    }, 3000);
  });

  it.skip("shows a add-to-cart button replacing a remove-from-cart button when remove-from-balled is clicked", async () => {
    renderWithContext(<ViewProjectDetails />, {
      rounds: [roundWithProjects],
      isLoading: false,
    });

    // mock screen size
    setWindowDimensions(1200, 800);

    expect(renderComponentsBasedOnDeviceSize()).toBe("desktop");

    // click add to cart
    const addToCart = screen.getAllByTestId("add-to-cart");
    fireEvent.click(addToCart[1]);

    await act(async () => {
      await waitFor(
        () => {
          expect(
            screen.queryAllByTestId("remove-from-cart")[1]
          ).toBeInTheDocument();
          expect(screen.queryByTestId("add-to-cart")).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    const removeFromCart = screen.getAllByTestId("remove-from-cart");
    fireEvent.click(removeFromCart[1]);

    await act(async () => {
      await waitFor(
        () => {
          expect(screen.queryAllByTestId("add-to-cart")[1]).toBeInTheDocument();
          expect(
            screen.queryByTestId("remove-from-cart")
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
