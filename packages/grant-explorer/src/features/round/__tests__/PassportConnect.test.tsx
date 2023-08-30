import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  makeRoundData,
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import { fetchPassport, submitPassport } from "../../api/passport";
import PassportConnect from "../PassportConnect";
import { Round } from "../../api/types";
import { payoutTokens } from "../../api/utils";
import { Mock } from "vitest";

const chainId = 5;
const roundId = faker.finance.ethereumAddress();

vi.mock("../../api/passport");
vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");

vi.mock("react-router-dom", async () => {
  const useParamsFn = () => ({
    chainId: chainId,
    roundId: roundId,
  });
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: useParamsFn,
  };
});

const userAddress = faker.finance.ethereumAddress();
const mockAccount = {
  address: userAddress,
  isConnected: true,
};

const mockJsonPromise = Promise.resolve({
  score: "1",
  address: userAddress,
  status: "DONE",
  evidence: {
    threshold: "0",
    rawScore: "1",
  },
});

const mockPassportPromise = {
  ok: true,
  json: () => mockJsonPromise,
} as unknown as Response;

vi.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
}));

process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID = "12";

describe("<PassportConnect/>", () => {
  describe("Navigation Buttons", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      let stubRound: Round;
      const roundStartTime = faker.date.recent();
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);
      const roundEndTime = faker.date.soon();
      const token = payoutTokens[0].address;

      // eslint-disable-next-line prefer-const
      stubRound = makeRoundData({
        id: roundId,
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        token: token,
      });

      renderWithContext(<PassportConnect />, { rounds: [stubRound] });
    });

    it("shows Home and Connect to Passport breadcrumb", async () => {
      await waitFor(() => {
        expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Connect to Passport")).toBeInTheDocument();
      });
    });

    it("shows back to browsing button on page load", async () => {
      await waitFor(() => {
        expect(
          screen.getByTestId("back-to-browsing-button")
        ).toBeInTheDocument();
      });
    });

    it("shows what is passport link on page load", async () => {
      await waitFor(() => {
        expect(screen.getByTestId("what-is-passport-link")).toBeInTheDocument();
      });
    });
  });

  describe("Passport Connect", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      let stubRound: Round;
      const roundStartTime = faker.date.recent();
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);
      const roundEndTime = faker.date.soon();
      const token = payoutTokens[0].address;

      // eslint-disable-next-line prefer-const
      stubRound = makeRoundData({
        id: roundId,
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        token: token,
      });

      const mockJsonPromise = Promise.resolve({
        score: "-1",
        address: userAddress,
        status: "DONE",
        evidence: {
          threshold: "0",
          rawScore: "-1",
        },
      });

      const mockPassportPromise = {
        ok: true,
        json: () => mockJsonPromise,
      } as unknown as Response;

      (fetchPassport as Mock).mockResolvedValueOnce(mockPassportPromise);
      (submitPassport as Mock).mockResolvedValueOnce(vi.fn());

      renderWithContext(<PassportConnect />, {
        rounds: [stubRound],
        isLoading: false,
      });
    });

    it("Should show the Create Passport button", async () => {
      await waitFor(async () => {
        expect(
          screen.getByTestId("create-passport-button")
        ).toBeInTheDocument();
      });
    });

    it("Should show the Recalculate Score button", async () => {
      await waitFor(() => {
        expect(
          screen.getByTestId("recalculate-score-button")
        ).toBeInTheDocument();
      });
    });

    it("Clicking the Recalculate Score button invokes submitPassport", async () => {
      await waitFor(async () => {
        fireEvent.click(await screen.findByTestId("recalculate-score-button"));

        expect(submitPassport).toHaveBeenCalled();
        expect(fetchPassport).toHaveBeenCalled();
      });
    });
  });
});

describe("<PassportConnect/>", () => {
  describe("PassportConnect Passport State", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("IF passport state return error status THEN it shows issue in fetching passport", async () => {
      let stubRound: Round;
      const roundStartTime = faker.date.recent();
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);
      const roundEndTime = faker.date.soon();
      const token = payoutTokens[0].address;

      // eslint-disable-next-line prefer-const
      stubRound = makeRoundData({
        id: roundId,
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        token: token,
      });

      const mockJsonPromise = Promise.resolve({
        score: "-1",
        address: userAddress,
        status: "ERROR",
        evidence: {
          threshold: "0",
          rawScore: "-1",
        },
      });

      const mockPassportPromise = {
        ok: true,
        json: () => mockJsonPromise,
      } as unknown as Response;

      (fetchPassport as Mock).mockResolvedValueOnce(mockPassportPromise);

      renderWithContext(<PassportConnect />, {
        rounds: [stubRound],
        isLoading: false,
      });

      await waitFor(() => {
        expect(
          screen.getByText("Passport Profile not detected.")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Please open Passport to troubleshoot.")
        ).toBeInTheDocument();
      });
    });

    it("IF passport state is match inelgible THEN it shows ineligible for matching", async () => {
      let stubRound: Round;
      const roundStartTime = faker.date.recent();
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);
      const roundEndTime = faker.date.soon();
      const token = payoutTokens[0].address;

      // eslint-disable-next-line prefer-const
      stubRound = makeRoundData({
        id: roundId,
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        token: token,
      });

      const mockJsonPromise = Promise.resolve({
        score: "1",
        address: userAddress,
        status: "DONE",
        evidence: {
          threshold: "2",
          rawScore: "1",
        },
      });

      const mockPassportPromise = {
        ok: true,
        json: () => mockJsonPromise,
      } as unknown as Response;

      (fetchPassport as Mock).mockResolvedValueOnce(mockPassportPromise);

      renderWithContext(<PassportConnect />, {
        rounds: [stubRound],
        isLoading: false,
      });

      await waitFor(() => {
        expect(screen.getByText("Ineligible for matching")).toBeInTheDocument();
      });
    });

    it("IF passport state is match eligible THEN it shows eligible for matching", async () => {
      let stubRound: Round;
      const roundStartTime = faker.date.recent();
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);
      const roundEndTime = faker.date.soon();
      const token = payoutTokens[0].address;

      // eslint-disable-next-line prefer-const
      stubRound = makeRoundData({
        id: roundId,
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        token: token,
      });

      const mockJsonPromise = Promise.resolve({
        score: "2",
        address: userAddress,
        status: "DONE",
        evidence: {
          threshold: "2",
          rawScore: "2",
        },
      });

      const mockPassportPromise = {
        ok: true,
        json: () => mockJsonPromise,
      } as unknown as Response;

      (fetchPassport as Mock).mockResolvedValueOnce(mockPassportPromise);

      renderWithContext(<PassportConnect />, {
        rounds: [stubRound],
        isLoading: false,
      });

      await waitFor(() => {
        expect(screen.getByText("Eligible for matching")).toBeInTheDocument();
      });
    });

    it("IF passport state is not connected THEN it shows ineligible for matching", async () => {
      let stubRound: Round;
      const roundStartTime = faker.date.recent();
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);
      const roundEndTime = faker.date.soon();
      const token = payoutTokens[0].address;

      // eslint-disable-next-line prefer-const
      stubRound = makeRoundData({
        id: roundId,
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        token: token,
      });

      (fetchPassport as Mock).mockResolvedValueOnce(mockPassportPromise);
      mockAccount.isConnected = false;

      renderWithContext(<PassportConnect />, {
        rounds: [stubRound],
        isLoading: false,
      });

      await waitFor(() => {
        expect(screen.getByText("Ineligible for matching")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Please create a Gitcoin Passport in order to continue."
          )
        ).toBeInTheDocument();
      });
    });
  });
});
