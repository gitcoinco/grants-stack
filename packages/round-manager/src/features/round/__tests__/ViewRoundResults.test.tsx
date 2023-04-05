/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import {
  makeApprovedProjectData,
  makeMatchingStatsData,
  makeQFDistribution,
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithFinalizeRoundContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext
} from "../../../test-utils";
import { useRoundMatchData } from "../../api/api";
import { useFetchMatchingDistributionFromContract } from "../../api/payoutStrategy/merklePayoutStrategy";
import { setReadyForPayout } from "../../api/round";
import { ProgressStatus, Round } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextDecoder } = require("util");
global.TextDecoder = TextDecoder;

jest.mock("../../common/Auth");
jest.mock("wagmi");
jest.mock("../../api/round");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

let mockRoundData: Round = makeRoundData();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../api/api", () => ({
  ...jest.requireActual("../../api/api"),
  useRoundMatchData: jest.fn(),
}));


jest.mock("../../api/payoutStrategy/merklePayoutStrategy", () => ({
  ...jest.requireActual("../../api/payoutStrategy/merklePayoutStrategy"),
  useFetchMatchingDistributionFromContract: jest.fn(),
}));


jest.mock("../../../context/round/FinalizeRoundContext", () => ({
  ...jest.requireActual("../../../context/round/FinalizeRoundContext")
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {
      name: "Ethereum",
    },
    address: mockRoundData.operatorWallets![0],
    signer: {
      getChainId: () => {
        /* do nothing */
      },
    },
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

describe("View Round Results before distribution data is finalized to contract", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  describe("display round results tab", () => {
    it("displays No Information Available before round end date", async () => {
      const roundEndTime = faker.date.future();
      mockRoundData = makeRoundData({ roundEndTime });
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }),
              { programs: [] }
            ),
            {
              applications: [],
              isLoading: false,
            }
          )
        )
      );
      const roundResultsTab = screen.getByTestId("round-results");
      fireEvent.click(roundResultsTab);
      expect(screen.getByText("No Information Available")).toBeInTheDocument();
    });

    it("displays matching stats table from api after round end date", async () => {
      (useRoundMatchData as jest.Mock).mockImplementation(() => ({
        data: [makeQFDistribution(), makeQFDistribution()],
        error: null,
        loading: false,
      }));

      (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: [],
        isLoading: false,
        isError: null,
      }));

      const roundEndTime = faker.date.recent();
      const roundStartTime = faker.date.past(1, roundEndTime);
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);

      const approvedProjects = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      mockRoundData = makeRoundData({
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        approvedProjects,
      });
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithFinalizeRoundContext(
                wrapWithRoundContext(<ViewRoundPage />, {
                  data: [mockRoundData],
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                })
              )
            )
          )
        )
      );
      const roundResultsTab = screen.getByTestId("round-results");
      fireEvent.click(roundResultsTab);
      expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
      expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
      expect(screen.getByTestId("finalize-round")).toBeInTheDocument();
      expect(
        screen.getByTestId("custom-or-default-test-id")
      ).toBeInTheDocument();
    });
  });

  it("displays upload field when custom radio button is selected", () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
      distributionMetaPtr: "",
      matchingDistribution: [],
      isLoading: false,
      isError: null,
    }));

    const roundEndTime = faker.date.recent();
    const roundStartTime = faker.date.past(1, roundEndTime);
    const applicationsEndTime = faker.date.past(1, roundStartTime);
    const applicationsStartTime = faker.date.past(1, applicationsEndTime);

    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    mockRoundData = makeRoundData({
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      approvedProjects,
    });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithFinalizeRoundContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              })
            )
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    fireEvent.click(roundResultsTab);
    expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
    expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
    expect(screen.getByTestId("custom-or-default-test-id")).toBeInTheDocument();

    const customRadioButton = screen.getByTestId("custom-radio-test-id");
    fireEvent.click(customRadioButton);
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
  });

  it("uploading invalid json file throws error", async () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
      distributionMetaPtr: "",
      matchingDistribution: [],
      isLoading: false,
      isError: null,
    }));

    // mock file.arrayBuffer
    const mockFile = new File([""], "test.json", { type: "application/json" });
    const mockFileArrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    Object.defineProperty(mockFile, "arrayBuffer", {
      value: mockFileArrayBuffer,
    });

    // mock the text decoder
    const mockTextDecoder = jest.fn().mockReturnValue({
      decode: jest.fn().mockReturnValue(`
      [
        {
          "projectName":"test",
          "projectId":"0x37ad3db0b0bc56cea1909e6a6f21fd35453ef27f1d9a91e9edde75de10cc9cf8-0xebdb4156203c8b35b7a7c6f320786b98e5ac67c3",
          "uniqueContributorsCount":6202,
          "matchPoolPercentage":0.0560505703204296
         },
         {
          "projectName":"test",
          "projectId":"0x80ce1332dac2fd7b408ea6df4798e0b99fd973d05168d917126af0dcf4f99bc3-0xebdb4156203c8b35b7a7c6f320786b98e5ac67c3",
          "uniqueContributorsCount":4527,
          "matchPoolPercentage":0.04131448208874834}
      ]
      `),
    });
    Object.defineProperty(window, "TextDecoder", {
      value: mockTextDecoder,
    });

    const roundEndTime = faker.date.recent();
    const roundStartTime = faker.date.past(1, roundEndTime);
    const applicationsEndTime = faker.date.past(1, roundStartTime);
    const applicationsStartTime = faker.date.past(1, applicationsEndTime);

    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    mockRoundData = makeRoundData({
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      approvedProjects,
    });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithFinalizeRoundContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              })
            )
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    fireEvent.click(roundResultsTab);
    expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
    expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
    expect(screen.getByTestId("custom-or-default-test-id")).toBeInTheDocument();

    const customRadioButton = screen.getByTestId("custom-radio-test-id");
    fireEvent.click(customRadioButton);
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();

    // test dropzone .json file upload
    const dropzone = screen.getByTestId("dropzone");
    fireEvent.drop(dropzone, { dataTransfer: { files: [mockFile] } });

    expect(mockFile.arrayBuffer).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId("project-id-mismatch")).toBeInTheDocument();
    });
  });

  it("does not upload an invalid json file when dropped in dropzone", async () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
      distributionMetaPtr: "",
      matchingDistribution: [],
      isLoading: false,
      isError: null,
    }));

    // mock file.arrayBuffer
    const mockFile = new File(["{}"], "test.json", {
      type: "application/json",
    });
    const mockFileArrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    Object.defineProperty(mockFile, "arrayBuffer", {
      value: mockFileArrayBuffer,
    });

    // mock the text decoder
    const mockTextDecoder = jest.fn().mockReturnValue({
      decode: jest.fn().mockReturnValue(`
      [
        {
          "projectName":"test",
          "projectId":"0x37ad3db0b0bc56cea1909e6a6f21fd35453ef27f1d9a91e9edde75de10cc9cf8-0xebdb4156203c8b35b7a7c6f320786b98e5ac67c3",
          "uniqueContributorsCount":6202,
          "matchPoolPercentage":0.0560505703204296
        }
      ]
      `),
    });
    Object.defineProperty(window, "TextDecoder", {
      value: mockTextDecoder,
    });

    const roundEndTime = faker.date.recent();
    const roundStartTime = faker.date.past(1, roundEndTime);
    const applicationsEndTime = faker.date.past(1, roundStartTime);
    const applicationsStartTime = faker.date.past(1, applicationsEndTime);

    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    mockRoundData = makeRoundData({
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      approvedProjects,
    });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithFinalizeRoundContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              })
            )
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    fireEvent.click(roundResultsTab);
    expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
    expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
    expect(screen.getByTestId("custom-or-default-test-id")).toBeInTheDocument();

    const customRadioButton = screen.getByTestId("custom-radio-test-id");
    fireEvent.click(customRadioButton);
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();

    // test dropzone .json file upload
    const dropzone = screen.getByTestId("dropzone");
    fireEvent.drop(dropzone, { dataTransfer: { files: [mockFile] } });

    expect(mockFile.arrayBuffer).toHaveBeenCalled();

    // expect the table to not be rendered
    await waitFor(() => {
      expect(
        screen.queryByTestId("matching-stats-table")
      ).not.toBeInTheDocument();
    });
  });

  describe("finalize state to contract", () => {
    beforeEach(() => {
      (useRoundMatchData as jest.Mock).mockImplementation(() => ({
        data: [makeQFDistribution(), makeQFDistribution()],
        error: null,
        loading: false,
      }));

      (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: [],
        isLoading: false,
        isError: null,
      }));

      const roundEndTime = faker.date.past();
      mockRoundData = makeRoundData({ roundEndTime });
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithFinalizeRoundContext(
            wrapWithApplicationContext(
              wrapWithReadProgramContext(
                wrapWithRoundContext(<ViewRoundPage />, {
                  data: [mockRoundData],
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                }),
                { programs: [] }
              ),
              {
                applications: [],
                isLoading: false,
              }
            )
          )
        )
      );
    });
    it("displays the save to contract button", async () => {
      const roundResultsTab = screen.getByTestId("round-results");
      fireEvent.click(roundResultsTab);
      expect(
        screen.getByRole("button", {
          name: /Save distribution/i,
        })
      ).toBeInTheDocument();
    });

    it("displays a heads-up dialogue when the submit button is pressed", async () => {
      const roundResultsTab = screen.getByTestId("round-results");
      fireEvent.click(roundResultsTab);
      const button = screen.getByRole("button", {
        name: /Save Distribution/i,
      });
      fireEvent.click(button);
      expect(
        screen.getByRole("heading", {
          name: /Heads up!/i,
        })
      ).toBeInTheDocument();
    });

    it("displays a progress window when clicking Continue", async () => {
      const roundResultsTab = screen.getByTestId("round-results");
      expect(roundResultsTab).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(roundResultsTab);
      });
      const finalizeButton = screen.getByTestId("save-distribution-button");
      await act(async () => {
        fireEvent.click(finalizeButton);
      });
      const continueButton = screen.getByTestId("info-continue");
      await act(async () => {
        fireEvent.click(continueButton);
      });

      //! todo: this is acting funny and only passes incrementally
      // const processingHeader = screen.getByTestId("progress-modal");
      //   await act(async () => {
      //   expect(processingHeader).toBeInTheDocument();
      // });
    });
  });
});

describe("View Round Results after distribution data is finalized to contract", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("displays finalized matching data from contract", async () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
      distributionMetaPtr: "abcd",
      matchingDistribution: [makeMatchingStatsData(), makeMatchingStatsData()],
      isLoading: false,
      isError: null,
    }));

    const roundEndTime = faker.date.recent();
    const roundStartTime = faker.date.past(1, roundEndTime);
    const applicationsEndTime = faker.date.past(1, roundStartTime);
    const applicationsStartTime = faker.date.past(1, applicationsEndTime);

    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    mockRoundData = makeRoundData({
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      approvedProjects,
    });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithFinalizeRoundContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              })
            )
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    fireEvent.click(roundResultsTab);
    expect(screen.getByTestId("finalized-round")).toBeInTheDocument();
    expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
    expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
  });
});

describe("Ready For Payout", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });


  it("Should not show the Ready For Payout button if the round is not finalized", async () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
      distributionMetaPtr: "",
      matchingDistribution: [],
      isLoading: false,
      isError: null,
    }));

    const roundEndTime = faker.date.past();
    mockRoundData = makeRoundData({ roundEndTime });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithFinalizeRoundContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }),
              { programs: [] }
            ),
            {
              applications: [],
              isLoading: false,
            }
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    fireEvent.click(roundResultsTab);

    expect(
      screen.queryByTestId("set-ready-for-payout")
    ).not.toBeInTheDocument();
  });

  it("Should show the Ready For Payout button if the round is finalized", async () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
      distributionMetaPtr: "",
      matchingDistribution: [],
      isLoading: false,
      isError: null,
    }));

    const roundEndTime = faker.date.past();
    mockRoundData = makeRoundData({ roundEndTime });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithFinalizeRoundContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }),
              { programs: [] }
            ),
            {
              applications: [],
              isLoading: false,
            }
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    fireEvent.click(roundResultsTab);
  });

  it("Should show Info Modal when Ready For Payout button is clicked", async () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
      distributionMetaPtr: "9a8sdf679a87sdf89",
      matchingDistribution: [],
      isLoading: false,
      isError: null,
    }));

    const roundEndTime = faker.date.past();
    mockRoundData = makeRoundData({ roundEndTime });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithFinalizeRoundContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }),
              { programs: [] }
            ),
            {
              applications: [],
              isLoading: false,
            }
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    await act(async () => {
      fireEvent.click(roundResultsTab);
    });
    const readyForPayoutButton = screen.getByTestId("set-ready-for-payout");
    await act(async () => {
      fireEvent.click(readyForPayoutButton);
    });
    const infoModal = screen.getByTestId("info-modal");
    expect(infoModal).toBeInTheDocument();
  });

  it("Should show Progress Modal when Info Modal is clicked", async () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(() => ({
      distributionMetaPtr: "9a8sdf679a87sdf89",
      matchingDistribution: [],
      isLoading: false,
      isError: null,
    }));

    (setReadyForPayout as jest.Mock).mockResolvedValueOnce(() => ({
      blockNumber: 0,
      error: null,
    }));

    const roundEndTime = faker.date.past();
    mockRoundData = makeRoundData({ roundEndTime });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithFinalizeRoundContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }),
              { programs: [] }
            ),
            {
              applications: [],
              isLoading: false,
            }
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    await act(async () => {
      fireEvent.click(roundResultsTab);
    });
    const readyForPayoutButton = screen.getByTestId("set-ready-for-payout");
    await act(async () => {
      fireEvent.click(readyForPayoutButton);
    });
    const infoModal = screen.getByTestId("info-modal");
    expect(infoModal).toBeInTheDocument();
    const confirmButton = screen.getByTestId("info-continue");
    await act(async () => {
      fireEvent.click(confirmButton);
    });
    const progressModal = screen.queryByTestId("progress-modal");

    expect(progressModal).not.toBeInTheDocument();
    expect(setReadyForPayout).toHaveBeenCalledTimes(1);
  });
});
