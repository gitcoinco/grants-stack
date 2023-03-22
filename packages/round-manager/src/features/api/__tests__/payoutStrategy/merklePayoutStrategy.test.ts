/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchProjectPaidInARound } from "common";
import { makeQFDistribution, makeRoundData } from "../../../../test-utils";
import { useGroupProjectsByPaymentStatus } from "../../payoutStrategy/merklePayoutStrategy";
import { ChainId } from "../../utils";
import { fetchMatchingDistribution } from "../../round";

jest.mock("../../round");

jest.mock("common");

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  graphql_fetch: jest.fn(),
  fetchFromIPFS: jest.fn(),
}));


const paidProjects = [
  makeQFDistribution(),
  makeQFDistribution(),
]

const unProjects = [
  makeQFDistribution(),
  makeQFDistribution(),
  makeQFDistribution(),
];

describe('merklePayoutStrategy', () => {

  describe.only('useGroupProjectsByPaymentStatus', () => {
    it('SHOULD group projects into paid and unpaid arrays', async () => {

      const round = makeRoundData();
      const chainId = ChainId.GOERLI_CHAIN_ID;

      const projects = [...paidProjects, ...unProjects];
      // TODO: Fix this test
      (fetchProjectPaidInARound as any).mockImplementation(() => ({paidProjects}));
      (fetchMatchingDistribution as any).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: projects
      }));

      const result = await useGroupProjectsByPaymentStatus(chainId, round.id!);

      // expect(result.paid).toEqual(paidProjects);
      // expect(result.paid).toEqual(unProjects);
    });
  });
});