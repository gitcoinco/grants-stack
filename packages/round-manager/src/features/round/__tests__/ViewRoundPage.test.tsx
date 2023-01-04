/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ViewRoundPage from "../ViewRoundPage";
import { GrantApplication, ProgressStatus, Round } from "../../api/types";
import {
  makeApprovedProjectData,
  makeGrantApplicationData,
  makeQFDistribution,
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { useParams } from "react-router-dom";
import { faker } from "@faker-js/faker";
import { useRoundMatchData } from "../../api/api";

jest.mock("../../common/Auth");
jest.mock("wagmi");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: () => {
      /* do nothing.*/
    },
  },
});

let mockRoundData: Round = makeRoundData();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../api/api", () => ({
  ...jest.requireActual("../../api/api"),
  useRoundMatchData: jest.fn(),
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: mockRoundData.operatorWallets![0],
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

describe("View Round", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("displays a 404 when there no round is found", () => {
    (useParams as jest.Mock).mockReturnValueOnce({
      id: undefined,
    });

    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewRoundPage />, {
              data: [],
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

    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("displays access denied when wallet accessing is not round operator", () => {
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewRoundPage />, {
              data: [{ ...mockRoundData, operatorWallets: [] }],
              fetchRoundStatus: ProgressStatus.IS_SUCCESS,
            }),
            { programs: [] }
          ),
          {
            applications: [],
          }
        )
      )
    );
    expect(screen.getByText("Access Denied!")).toBeInTheDocument();
  });

  it("displays Round application button", () => {
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewRoundPage />, {
              data: [mockRoundData],
              fetchRoundStatus: ProgressStatus.IS_SUCCESS,
            }),
            { programs: [] }
          )
        )
      )
    );
    expect(screen.getByText("Round Application")).toBeInTheDocument();
  });

  it("displays copy when there are no applicants for a given round", () => {
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
    expect(screen.getByText("No Applications")).toBeInTheDocument();
  });

  it("displays side navigation bar in the round page", () => {
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
    expect(screen.getByTestId("side-nav-bar")).toBeInTheDocument();
    expect(screen.getByText("Grant Applications")).toBeInTheDocument();
    expect(screen.getByText("Round Stats")).toBeInTheDocument();
    expect(screen.getByText("Funding Admin")).toBeInTheDocument();
  });

  it("indicates how many of each kind of application there are", () => {
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
            applications: mockApplicationData,
            isLoading: false,
          }
        )
      )
    );

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

  it("displays loading spinner when round is loading", () => {
    render(
      wrapWithApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewRoundPage />, {
            data: [],
            fetchRoundStatus: ProgressStatus.IN_PROGRESS,
          }),
          { programs: [] }
        )
      )
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("displays option to view round's explorer", () => {
    render(
      wrapWithApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewRoundPage />, {
            data: [mockRoundData],
          })
        )
      )
    );
    const roundExplorer = screen.getByTestId("round-explorer");

    expect(roundExplorer).toBeInTheDocument();
  });

  describe("display funding admin tab", () => {
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
      const fundingAdminTab = screen.getByTestId("funding-admin");
      fireEvent.click(fundingAdminTab);
      expect(screen.getByText("No Information Available")).toBeInTheDocument();
    });

    it("displays matching stats table in funding admin page after round end date", async () => {
      (useRoundMatchData as jest.Mock).mockImplementation(() => ({
        return: {
          data: [makeQFDistribution(), makeQFDistribution()],
          error: null,
          loading: false,
        },
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
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              })
            )
          )
        )
      );
      const fundingAdminTab = screen.getByTestId("funding-admin");
      fireEvent.click(fundingAdminTab);
      expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
      expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
      expect(
        screen.getByTestId("custom-or-default-test-id")
      ).toBeInTheDocument();
    });
  });

  it("displays upload field when custom radio button is selected", () => {
    (useRoundMatchData as jest.Mock).mockImplementation(() => ({
      return: {
        data: [makeQFDistribution(), makeQFDistribution()],
        error: null,
        loading: false,
      },
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
            wrapWithRoundContext(<ViewRoundPage />, {
              data: [mockRoundData],
              fetchRoundStatus: ProgressStatus.IS_SUCCESS,
            })
          )
        )
      )
    );
    const fundingAdminTab = screen.getByTestId("funding-admin");
    fireEvent.click(fundingAdminTab);
    expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
    expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
    expect(screen.getByTestId("custom-or-default-test-id")).toBeInTheDocument();

    const customRadioButton = screen.getByTestId("custom-radio-test-id");
    fireEvent.click(customRadioButton);
    expect(screen.getByTestId("drop-zone-test-id")).toBeInTheDocument();
  });

  // it("uploads a json file when dropped in dropzone", async () => {
  //   (useRoundMatchData as jest.Mock).mockImplementation(() => ({
  //     return: {
  //       data: [makeQFDistribution(), makeQFDistribution()],
  //       error: null,
  //       loading: false,
  //     },
  //   }));
  //
  //   // mock file.arrayBuffer
  //   const mockFile = new File([""], "test.json", { type: "application/json" });
  //   const mockFileArrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
  //   Object.defineProperty(mockFile, "arrayBuffer", {
  //     value: mockFileArrayBuffer,
  //   });
  //
  //   // mock the text decoder
  //   const mockTextDecoder = jest.fn().mockReturnValue({
  //     decode: jest.fn().mockReturnValue(`
  //     [
  //       {
  //         "projectName":"test",
  //         "projectId":"0x37ad3db0b0bc56cea1909e6a6f21fd35453ef27f1d9a91e9edde75de10cc9cf8-0xebdb4156203c8b35b7a7c6f320786b98e5ac67c3",
  //         "uniqueContributorsCount":6202,
  //         "matchPoolPercentage":0.0560505703204296
  //        },
  //        {
  //         "projectName":"test",
  //         "projectId":"0x80ce1332dac2fd7b408ea6df4798e0b99fd973d05168d917126af0dcf4f99bc3-0xebdb4156203c8b35b7a7c6f320786b98e5ac67c3",
  //         "uniqueContributorsCount":4527,
  //         "matchPoolPercentage":0.04131448208874834}
  //     ]
  //     `),
  //   });
  //   Object.defineProperty(window, "TextDecoder", {
  //     value: mockTextDecoder,
  //   });
  //
  //   const roundEndTime = faker.date.recent();
  //   const roundStartTime = faker.date.past(1, roundEndTime);
  //   const applicationsEndTime = faker.date.past(1, roundStartTime);
  //   const applicationsStartTime = faker.date.past(1, applicationsEndTime);
  //
  //   const approvedProjects = [
  //     makeApprovedProjectData(),
  //     makeApprovedProjectData(),
  //     makeApprovedProjectData(),
  //   ];
  //   mockRoundData = makeRoundData({
  //     applicationsStartTime,
  //     applicationsEndTime,
  //     roundStartTime,
  //     roundEndTime,
  //     approvedProjects,
  //   });
  //   render(
  //     wrapWithBulkUpdateGrantApplicationContext(
  //       wrapWithApplicationContext(
  //         wrapWithReadProgramContext(
  //           wrapWithRoundContext(<ViewRoundPage />, {
  //             data: [mockRoundData],
  //             fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //           })
  //         )
  //       )
  //     )
  //   );
  //   const fundingAdminTab = screen.getByTestId("funding-admin");
  //   fireEvent.click(fundingAdminTab);
  //   expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
  //   expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
  //   expect(screen.getByTestId("custom-or-default-test-id")).toBeInTheDocument();
  //
  //   const customRadioButton = screen.getByTestId("custom-radio-test-id");
  //   fireEvent.click(customRadioButton);
  //   expect(screen.getByTestId("drop-zone-test-id")).toBeInTheDocument();
  //
  //   // test dropzone .json file upload
  //   const dropzone = screen.getByTestId("drop-zone-test-id");
  //   fireEvent.drop(dropzone, { dataTransfer: { files: [mockFile] } });
  //
  //   expect(mockFile.arrayBuffer).toHaveBeenCalled();
  //   await waitFor(() => {
  //     expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
  //   });
  // });
  //
  // it("does not upload an invalid json file when dropped in dropzone", async () => {
  //   (useRoundMatchData as jest.Mock).mockImplementation(() => ({
  //     return: {
  //       data: [makeQFDistribution(), makeQFDistribution()],
  //       error: null,
  //       loading: false,
  //     },
  //   }));
  //
  //   // mock file.arrayBuffer
  //   const mockFile = new File([""], "test.json", { type: "application/json" });
  //   const mockFileArrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
  //   Object.defineProperty(mockFile, "arrayBuffer", {
  //     value: mockFileArrayBuffer,
  //   });
  //
  //   // mock the text decoder
  //   const mockTextDecoder = jest.fn().mockReturnValue({
  //     decode: jest.fn().mockReturnValue(`
  //     [
  //       {
  //         "bad":"bad",
  //         "bad":"bad-0xebdb4156203c8b35b7a7c6f320786b98e5ac67c3",
  //         "bad":6202,
  //         "bad":0.0560505703204296
  //       }
  //     ]
  //     `),
  //   });
  //   Object.defineProperty(window, "TextDecoder", {
  //     value: mockTextDecoder,
  //   });
  //
  //   const roundEndTime = faker.date.recent();
  //   const roundStartTime = faker.date.past(1, roundEndTime);
  //   const applicationsEndTime = faker.date.past(1, roundStartTime);
  //   const applicationsStartTime = faker.date.past(1, applicationsEndTime);
  //
  //   const approvedProjects = [
  //     makeApprovedProjectData(),
  //     makeApprovedProjectData(),
  //     makeApprovedProjectData(),
  //   ];
  //   mockRoundData = makeRoundData({
  //     applicationsStartTime,
  //     applicationsEndTime,
  //     roundStartTime,
  //     roundEndTime,
  //     approvedProjects,
  //   });
  //   render(
  //     wrapWithBulkUpdateGrantApplicationContext(
  //       wrapWithApplicationContext(
  //         wrapWithReadProgramContext(
  //           wrapWithRoundContext(<ViewRoundPage />, {
  //             data: [mockRoundData],
  //             fetchRoundStatus: ProgressStatus.IS_SUCCESS,
  //           })
  //         )
  //       )
  //     )
  //   );
  //   const fundingAdminTab = screen.getByTestId("funding-admin");
  //   fireEvent.click(fundingAdminTab);
  //   expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
  //   expect(screen.getByTestId("matching-stats-table")).toBeInTheDocument();
  //   expect(screen.getByTestId("custom-or-default-test-id")).toBeInTheDocument();
  //
  //   const customRadioButton = screen.getByTestId("custom-radio-test-id");
  //   fireEvent.click(customRadioButton);
  //   expect(screen.getByTestId("drop-zone-test-id")).toBeInTheDocument();
  //
  //   // test dropzone .json file upload
  //   const dropzone = screen.getByTestId("drop-zone-test-id");
  //   fireEvent.drop(dropzone, { dataTransfer: { files: [mockFile] } });
  //
  //   expect(mockFile.arrayBuffer).toHaveBeenCalled();
  //
  //   // expect the table to not be rendered
  //   await waitFor(() => {
  //     expect(
  //       screen.queryByTestId("matching-stats-table")
  //     ).not.toBeInTheDocument();
  //   });
  // });
});
