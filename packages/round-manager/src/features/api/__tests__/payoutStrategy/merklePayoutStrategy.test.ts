/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchProjectPaidInARound } from "common";
import { makeQFDistribution, makeRoundData } from "../../../../test-utils";
import { useGroupProjectsByPaymentStatus } from "../../payoutStrategy/merklePayoutStrategy";
import { ChainId } from "../../utils";
import { fetchMatchingDistribution } from "../../round";
import React from "react";
import { useOutletContext } from "react-router-dom";
import * as wagmi from "wagmi";
import { MockConnector } from 'wagmi/connectors/mock'
import { providers } from "ethers";
import { goerli } from "wagmi/chains";

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

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useNetwork: () => ({
    chain: jest.fn(),
    chains: [
      {
        id: 5,
        name: "Goerli",
      },
    ],
    useSigner: () => ({
      signer: jest.fn(),
    }),
    useProvider: () => ({
      provider: jest.fn(),
    }),
    useNetwork: () => ({
      chain: jest.fn(),
    }),
  }),
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
    it('SHOULD group projects into paid and unpaid arrays', () => {
      const setState = jest.fn();
      const returnValue = {paid: [], unpaid: []};
      const useStateSpy = jest.spyOn(React, "useState");
      useStateSpy.mockImplementationOnce(() => [returnValue, setState]);

      // TODO: Add useOutletContext mock with this data
      // const data = {
      //   address: "0x123",
      //   chain: { id: 5, name: "Goerli", network: "Goerli" },
      //   provider: {},
      //   signer: {},
      // }

      const mockProvider = new providers.JsonRpcProvider("http://localhost:8545");

      const connector = new MockConnector({
        chains: [goerli],
        options: {
          chainId: goerli.id,
          signer: new providers.JsonRpcSigner(mockProvider),
          flags: {
            isAuthorized: true,
          }
        }
      });

      const round = makeRoundData();
      const chainId = ChainId.GOERLI_CHAIN_ID;

      const projects = [...paidProjects, ...unProjects];
      // TODO: Fix this test
      (fetchProjectPaidInARound as any).mockImplementation(() => ({paidProjects}));
      (fetchMatchingDistribution as any).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: projects
      }));

      const result = useGroupProjectsByPaymentStatus(chainId, round.id!);

      // expect(result.paid).toEqual(paidProjects);
      // expect(result.paid).toEqual(unProjects);
    });
  });
});