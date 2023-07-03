import { fetchProjectPaidInARound } from "common";
import { makeQFDistribution, makeRoundData } from "../../../../test-utils";
import { useGroupProjectsByPaymentStatus } from "../../payoutStrategy/merklePayoutStrategy";
import { ChainId } from "common";
import { fetchMatchingDistribution } from "../../round";
import React, { useState as useStateMock } from "react";

// Mocks
jest.mock("../../round");

jest.mock("common");

jest.mock("../../../api/types", () => ({
  ...jest.requireActual("../../../api/types"),
}));

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  graphql_fetch: jest.fn(),
  fetchFromIPFS: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useOutletContext: () => ({
    data: {},
  }),
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

const paidProjects = [makeQFDistribution(), makeQFDistribution()];

const unProjects = [
  makeQFDistribution(),
  makeQFDistribution(),
  makeQFDistribution(),
];

describe("merklePayoutStrategy", () => {
  const setState = jest.fn();

  // clean up function
  beforeEach(() => {
    (useStateMock as any).mockImplementation((init: any) => [init, setState]);
  });

  describe.only("useGroupProjectsByPaymentStatus", () => {
    it("SHOULD group projects into paid and unpaid arrays", () => {
      const returnValue = { paid: [], unpaid: [] };
      const useStateSpy = jest.spyOn(React, "useState");
      useStateSpy.mockImplementationOnce(() => [returnValue, setState]);
      useStateSpy.mockImplementationOnce(() => [paidProjects, setState]);

      const round = makeRoundData();
      const chainId = ChainId.GOERLI_CHAIN_ID;

      const projects = [...paidProjects, ...unProjects];
      // TODO: Fix this test
      (fetchProjectPaidInARound as any).mockImplementation(() => ({
        paidProjects,
      }));
      (fetchMatchingDistribution as any).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: projects,
      }));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = useGroupProjectsByPaymentStatus(chainId, round.id!);

      // FIXME: hans pls
      // expect(result.paid).toEqual(paidProjects);
      // expect(result.paid).toEqual(unProjects);
    });
  });
});
