import { useAccount, useNetwork } from "wagmi";
import {
  Client as AlloIndexerClient,
  DetailedVote as Contribution,
} from "allo-indexer-client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { PayoutToken } from "../api/types";
import { getPayoutTokenOptions } from "../api/utils";

type ContributionHistoryState =
  | { type: "loading" }
  | { type: "loaded"; data: Contribution[] }
  | { type: "error"; error: Error };

const useContributionHistory = (chainId: number, address: string) => {
  const [state, setState] = useState<ContributionHistoryState>({
    type: "loading",
  });

  useEffect(() => {
    console.log("loading", chainId, address);

    if (!process.env.REACT_APP_ALLO_API_URL) {
      throw new Error("REACT_APP_ALLO_API_URL is not set");
    }

    const client = new AlloIndexerClient(
      fetch.bind(window),
      process.env.REACT_APP_ALLO_API_URL,
      chainId
    );

    client
      .getContributionsByAddress(address)
      .then((data) => {
        console.log("loaded", data);
        setState({ type: "loaded", data });
      })
      .catch((error) => {
        setState({ type: "error", error });
      });
  }, [chainId, address]);

  return state;
};

function StatCard(props: { title: string; value: string | undefined }) {
  return (
    <div className="rounded border border-violet-400 p-4">
      <div className="font-bold">{props.title}</div>
      <div>{props.value}</div>
    </div>
  );
}

function ViewContributionHistoryDisplay(props: {
  tokens: Record<string, PayoutToken>;
  contributions: Contribution[];
}) {
  return (
    <div>
      <h1>Donation History</h1>
      <div className="flex gap-4">
        <StatCard title="Total Donated" value="1000" />
        <StatCard title="Total Projects" value="1000" />
      </div>
      <table>
        <tr>
          <th>Project</th>
          <th>Donation</th>
          <th>Transaction information</th>
        </tr>
        {props.contributions.map((contribution) => {
          const token = props.tokens[contribution.token];

          let formattedAmount = "N/A";

          if (token) {
            formattedAmount = `${ethers.utils.formatUnits(
              contribution.amount,
              token.decimal
            )} ${token.name}`;
          }

          return (
            <tr key={contribution.id} className="border-b">
              <td>
                {contribution.roundName}
                {contribution.projectTitle}
              </td>
              <td>{formattedAmount}</td>
              <td>{contribution.transaction}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
}

function ViewContributionHistoryFetcher(props: {
  chainId: number;
  address: string;
}) {
  const contributionHistory = useContributionHistory(
    props.chainId,
    props.address
  );

  const tokens = Object.fromEntries(
    getPayoutTokenOptions(String(props.chainId)).map((token) => [
      token.address,
      token,
    ])
  );

  if (contributionHistory.type === "loading") {
    return <div>Loading...</div>;
  } else if (contributionHistory.type === "error") {
    return <div>{contributionHistory.error.toString()}</div>;
  } else {
    return (
      <ViewContributionHistoryDisplay
        tokens={tokens}
        contributions={contributionHistory.data}
      />
    );
  }
}

export default function () {
  const params = useParams();
  const { address: walletAddress } = useAccount();
  const { chain } = useNetwork();

  const chainId = params.chainId ? Number(params.chainId) : chain?.id;
  const address = params.address ?? walletAddress;

  if (chainId === undefined || address === undefined) {
    return null;
  }

  return <ViewContributionHistoryFetcher chainId={chainId} address={address} />;
}
