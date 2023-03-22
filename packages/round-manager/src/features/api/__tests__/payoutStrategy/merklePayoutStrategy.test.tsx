import { fetchProjectPaidInARound } from "common";
import { useState as useStateMock } from "react";
import { makeMatchingStatsData, makeRoundData } from "../../../../test-utils";
import { ChainId } from "../../utils";

import * as merklePayoutStrategy from "../../payoutStrategy/merklePayoutStrategy";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

// Mocks
const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      /* do nothing.*/
    },
  },
};

jest.mock("../../ipfs");
jest.mock("../../subgraph");
jest.mock("../../round");
jest.mock("../../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));

jest.mock("common");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../../api/types", () => ({
  ...jest.requireActual("../../../api/types"),
}));

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  graphql_fetch: jest.fn(),
  fetchFromIPFS: jest.fn(),
}));

const mockPaidProjects = [makeMatchingStatsData(), makeMatchingStatsData()];

const mockUnpaidProjects = [
  makeMatchingStatsData(),
  makeMatchingStatsData(),
  makeMatchingStatsData(),
];

jest.mock("../../payoutStrategy/merklePayoutStrategy", () => {
  const originalModule = jest.requireActual(
    "../../payoutStrategy/merklePayoutStrategy"
  );
  return {
    ...originalModule,
    useFetchMatchingDistributionFromContract: jest
      .fn()
      .mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: [...mockPaidProjects, ...mockUnpaidProjects],
        isLoading: false,
        isError: null,
      })),
  };
});

jest.mock("../../payoutStrategy/merklePayoutStrategy", () => ({
  useFetchMatchingDistributionFromContract: jest.fn(),
  ...jest.requireActual("../../payoutStrategy/merklePayoutStrategy"),
}));

describe("merklePayoutStrategy", () => {
  // clean up function
  beforeEach(() => {
    jest.clearAllMocks();

    (useStateMock as any).mockImplementation((init: any) => [init, jest.fn()]);
  });

  describe.only("useGroupProjectsByPaymentStatus", () => {
    it("SHOULD group projects into paid and unpaid arrays", async () => {
      const round = makeRoundData();
      const chainId = ChainId.GOERLI_CHAIN_ID;

      (fetchProjectPaidInARound as any).mockImplementation(
        () => mockPaidProjects
      );

      const result = await merklePayoutStrategy.useGroupProjectsByPaymentStatus(
        chainId,
        round.id!
      );
      console.log(result);

      // expect(result.paid).toEqual(mockPaidProjects);
      // expect(result.paid).toEqual(mockUnpaidProjects);
    });
  });
});
