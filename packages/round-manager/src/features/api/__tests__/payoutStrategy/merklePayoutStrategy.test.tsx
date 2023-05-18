import { useFetchProjectPaidInRound } from "common";
import { makeQFDistribution, makeRoundData } from "../../../../test-utils";
import { useGroupProjectsByPaymentStatus } from "../../payoutStrategy/merklePayoutStrategy";
import { ChainId } from "../../utils";
import { fetchMatchingDistribution } from "../../round";
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("../../round");

jest.mock("common");

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  graphql_fetch: jest.fn(),
  fetchFromIPFS: jest.fn(),
}));

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  usePublicClient: () => ({
    data: {
      getChainId: () => 5,
    },
  }),
}));

const paidProjects = [makeQFDistribution(), makeQFDistribution()];

const unpaidProjects = [
  makeQFDistribution(),
  makeQFDistribution(),
  makeQFDistribution(),
];

jest.mock("../../payoutStrategy/merklePayoutStrategy", () => ({
  ...jest.requireActual("../../payoutStrategy/merklePayoutStrategy"),
  useFetchMatchingDistributionFromContract: jest.fn(),
}));

describe("merklePayoutStrategy", () => {
  describe("useGroupProjectsByPaymentStatus", () => {
    it("SHOULD group projects into paid and unpaid arrays", async () => {
      const round = makeRoundData();
      const chainId = ChainId.GOERLI_CHAIN_ID;

      const projects = [...paidProjects, ...unpaidProjects];
      (useFetchProjectPaidInRound as any).mockImplementation(
        () => paidProjects
      );
      (fetchMatchingDistribution as any).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: projects,
      }));

      render(<TestComponent chainId={chainId} roundId={round.id as string} />);

      expect(await screen.findByTestId("paid")).toHaveTextContent(
        paidProjects.length.toString()
      );
      expect(await screen.findByTestId("unpaid")).toHaveTextContent(
        unpaidProjects.length.toString()
      );
    });
  });
});

function TestComponent(props: { chainId: number; roundId: string }) {
  const { paid, unpaid } = useGroupProjectsByPaymentStatus(
    props.chainId,
    props.roundId
  );

  return (
    <div>
      {paid.length && <div data-testid={"paid"}>{paid.length}</div>}
      {unpaid.length && <div data-testid={"unpaid"}>{unpaid.length}</div>}
    </div>
  );
}
