/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { screen } from "@testing-library/react";
import { useListRoundsQuery } from "../../api/services/round";
import ViewRoundPage from "../ViewRoundPage";
import { GrantApplication, Round } from "../../api/types";
import {
  makeGrantApplicationData,
  makeRoundData,
  renderWithApplicationContext,
} from "../../../test-utils";
import { useBulkUpdateGrantApplicationsMutation } from "../../api/services/grantApplication";
import { useDisconnect, useSwitchNetwork } from "wagmi";

jest.mock("../../common/Auth");
jest.mock("../../api/services/round");
jest.mock("../../api/services/grantApplication");
jest.mock("wagmi");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

const mockRoundData: Round = makeRoundData();
const mockApplicationData: GrantApplication[] = [];

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: mockRoundData.operatorWallets![0],
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

describe("the view round page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useListRoundsQuery as jest.Mock).mockReturnValue({
      round: mockRoundData,
      isLoading: false,
      isSuccess: true,
    });

    (useBulkUpdateGrantApplicationsMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      {
        isLoading: false,
      },
    ]);

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("should display 404 when there no round is found", () => {
    (useListRoundsQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
    });

    renderWithApplicationContext(<ViewRoundPage />, {
      applications: [],
      isLoading: false,
    });

    // renderWrapped(<ViewRoundPage />);
    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("should display access denied when wallet accessing is not program operator", () => {
    (useListRoundsQuery as jest.Mock).mockReturnValue({
      round: makeRoundData(),
      isLoading: false,
      isSuccess: true,
    });

    renderWithApplicationContext(<ViewRoundPage />, {
      applications: mockApplicationData,
      isLoading: false,
    });

    expect(screen.getByText("Access Denied!")).toBeInTheDocument();
  });

  it("should display Copy to Clipboard", () => {
    renderWithApplicationContext(<ViewRoundPage />, {
      applications: [],
      isLoading: false,
    });
    expect(screen.getByText("Copy to clipboard")).toBeInTheDocument();
  });

  it("should display copy when there are no applicants for a given round", () => {
    renderWithApplicationContext(<ViewRoundPage />, {
      applications: [],
      isLoading: false,
    });

    expect(screen.getByText("No Applications")).toBeInTheDocument();
  });

  it("should indicate how many of each kind of application there are", () => {
    const mockApplicationData: GrantApplication[] = [
      makeGrantApplicationData(),
      makeGrantApplicationData(),
      makeGrantApplicationData(),
      makeGrantApplicationData(),
    ];

    mockApplicationData[0].status = "PENDING";
    mockApplicationData[1].status = "PENDING";
    mockApplicationData[2].status = "REJECTED";
    mockApplicationData[3].status = "APPROVED";

    renderWithApplicationContext(<ViewRoundPage />, {
      applications: mockApplicationData,
      isLoading: false,
    });

    expect(
      parseInt(screen.getByTestId("received-application-counter").textContent!)
    ).toBe(2);
    expect(
      parseInt(screen.getByTestId("rejected-application-counter").textContent!)
    ).toBe(1);
    expect(
      parseInt(screen.getByTestId("approved-application-counter").textContent!)
    ).toBe(1);
  });

  it("should display loading spinner when round is loading", () => {
    (useListRoundsQuery as jest.Mock).mockReturnValue({
      isLoading: true,
    });

    renderWithApplicationContext(<ViewRoundPage />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
});
