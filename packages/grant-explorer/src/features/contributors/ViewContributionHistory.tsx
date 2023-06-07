import { chainId, useAccount, useEnsName } from "wagmi";
import {
  Client as AlloIndexerClient,
  DetailedVote as Contribution,
} from "allo-indexer-client";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ethers } from "ethers";
import { PayoutToken } from "../api/types";
import { getPayoutTokenOptions } from "../api/utils";
import Navbar from "../common/Navbar";
import { ReactComponent as DonationHistoryBanner } from "../../assets/donnation-history-banner.svg";
import { ChainId } from "../api/utils";
import blockies from "ethereum-blockies";
import CopyToClipboardButton from "../common/CopyToClipboardButton";

type ContributionHistoryState =
  | { type: "loading" }
  | {
      type: "loaded";
      data: { chainId: number; data: Contribution[] | never[] }[];
    }
  | { type: "error"; error: string };

const useContributionHistory = (chainIds: number[], address: string) => {
  const [state, setState] = useState<ContributionHistoryState>({
    type: "loading",
  });

  useEffect(() => {
    console.log("loading", chainIds, address);

    if (!process.env.REACT_APP_ALLO_API_URL) {
      throw new Error("REACT_APP_ALLO_API_URL is not set");
    }

    const histories: { chainId: number; data: Contribution[] | never[] }[] = [];
    let allChainsError = true;

    const fetchContributions = async () => {
      const fetchPromises = chainIds.map((chainId: number) => {
        if (!process.env.REACT_APP_ALLO_API_URL) {
          throw new Error("REACT_APP_ALLO_API_URL is not set");
        }

        const client = new AlloIndexerClient(
          fetch.bind(window),
          process.env.REACT_APP_ALLO_API_URL,
          chainId
        );

        return client
          .getContributionsByAddress(address)
          .then((data) => {
            const history = { chainId, data };
            histories.push(history);
            allChainsError = false; // If data is fetched successfully for any chain, set allChainsError to false
          })
          .catch((error) => {
            console.log(
              `Error fetching contribution history for chain ${chainId}:`,
              error
            );
            const history = { chainId, data: [] };
            histories.push(history);
          });
      });

      await Promise.all(fetchPromises);

      if (allChainsError) {
        setState({
          type: "error",
          error: "Error fetching contribution history for all chains",
        });
      } else {
        console.log("loaded", histories);
        setState({ type: "loaded", data: histories });
      }
    };

    fetchContributions();
  }, [chainIds, address]);

  return state;
};

function StatCard(props: { title: string; value: string | undefined }) {
  return (
    <div className="rounded border border-violet-400 p-4 w-1/4">
      <div className="font-bold text-sm pb-4">{props.title}</div>
      <div className="text-grey-400 text-xl">{props.value}</div>
    </div>
  );
}

function ViewContributionHistoryDisplay(props: {
  tokens: Record<string, PayoutToken>;
  contributions: { chainId: number; data: Contribution[] | never[] }[];
  address: string;
}) {
  const { data: ensName } = useEnsName({
    address: props.address,
  });
  const addressLogo = blockies
    .create({ seed: props.address.toLowerCase() })
    .toDataURL();

  const [totalDonations, setTotalDonations] = useState(0);
  const [totalUniqueContributions, setTotalUniqueContributions] = useState(0);
  const [totalProjectsFunded, setTotalProjectsFunded] = useState(0);

  useEffect(() => {
    let totalDonations = 0;
    let totalUniqueContributions = 0;
    const projects: string[] = [];
    props.contributions.forEach((chainContribution) => {
      const { data } = chainContribution;
      data.forEach((contribution) => {
        const token = props.tokens[contribution.token];
        if (token) {
          totalDonations += contribution.amountUSD;
          totalUniqueContributions += 1;
          const project = contribution.projectId;
          if (!projects.includes(project)) {
            projects.push(project);
          }
        }
      });
    });
    setTotalDonations(totalDonations);
    setTotalUniqueContributions(totalUniqueContributions);
    setTotalProjectsFunded(projects.length);
  }, [props.contributions, props.tokens]);

  return (
    <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen">
      <main>
        <div className="border-b pb-2 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-4"
              src={addressLogo}
              alt="Address Logo"
            />
            <div className="text-xl">
              {ensName ||
                props.address.slice(0, 6) + "..." + props.address.slice(-4)}
            </div>
          </div>
          <CopyToClipboardButton
            textToCopy={window.location.href}
            styles="text-xs p-2"
            iconStyle="h-4 w-4 mr-1"
          />
        </div>
        <div className="text-lg">Donation Impact</div>
        <div className="flex gap-4 my-4">
          <StatCard
            title="Total Donations"
            value={"$ " + totalDonations.toFixed(2).toString()}
          />
          <StatCard
            title="Unique Contributions"
            value={totalUniqueContributions.toString()}
          />
          <StatCard
            title="Projects Funded"
            value={totalProjectsFunded.toString()}
          />
        </div>
        <div className="text-lg my-4">Donation History</div>
        <div className="text-lg bg-violet-100 text-black px-2 px-2">
          All Rounds
        </div>
        <table className="border-collapse">
          <tr className="text-left">
            <th className="p-4">Project</th>
            <th className="p-4">Donation</th>
            <th className="p-4">Transaction information</th>
          </tr>
          {props.contributions.map((chainContribution) => {
            const { chainId, data } = chainContribution;
            return data.map((contribution) => {
              const token = props.tokens[contribution.token];

              let formattedAmount = "N/A";

              if (token) {
                formattedAmount = `${ethers.utils.formatUnits(
                  contribution.amount,
                  token.decimal
                )} ${token.name}`;
              }

              return (
                <tr key={contribution.id}>
                  <td className="border-b p-4">
                    <div className="flex items-center">
                      <Link
                        className="underline inline-block max-w-[250px] truncate"
                        title={contribution.roundName}
                        to={`/round/${chainId}/${contribution.roundId}`}
                      >
                        {contribution.roundName}
                      </Link>
                      <ChevronRightIcon className="h-4 inline mx-2" />
                      <Link
                        className="underline inline-block max-w-[250px] truncate"
                        title={contribution.projectTitle}
                        to={`/round/${chainId}/${contribution.roundId}/${contribution.projectId}`}
                      >
                        {contribution.projectTitle}
                      </Link>
                    </div>
                    {/* Todo: display contribution timestamp */}
                    {/* <div className="text-sm text-gray-500">4 mins ago</div> */}
                  </td>
                  <td className="border-b p-4">{formattedAmount}</td>
                  <td className="border-b p-4">{contribution.transaction}</td>
                </tr>
              );
            });
          })}
        </table>
      </main>
    </div>
  );
}

function ViewContributionHistoryWithoutDonations() {
  return (
    <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen bottom-16">
      <main>
        <div className="text-lg">Donation History</div>
        <div className="flex justify-center">
          <div className="w-3/4 my-6 text-center mx-auto">
            <p className="text-md">
              This is your donation history page, where you can keep track of
              all the public goods you've funded. As you make donations, your
              transaction history will appear here.
            </p>
            <div />
          </div>
        </div>
        <div className="flex justify-center">
          {" "}
          {/* Add flex justify-center class */}
          <DonationHistoryBanner />
        </div>
      </main>
    </div>
  );
}

function ViewContributionHistoryFetcher(props: {
  address: string;
  chainIds: number[];
}) {
  const contributionHistory = useContributionHistory(
    props.chainIds,
    props.address
  );

  const tokens = Object.fromEntries(
    getPayoutTokenOptions(String(chainId)).map((token) => [
      token.address,
      token,
    ])
  );

  if (contributionHistory.type === "loading") {
    return <div>Loading...</div>;
  } else if (contributionHistory.type === "error") {
    console.error("Error", contributionHistory);
    return <ViewContributionHistoryWithoutDonations />;
  } else {
    return (
      <ViewContributionHistoryDisplay
        tokens={tokens}
        contributions={contributionHistory.data}
        address={props.address}
      />
    );
  }
}

function getChainIds(): number[] {
  const isProduction = process.env.REACT_APP_ENV === "production";
  if (isProduction) {
    return [
      Number(ChainId.MAINNET),
      Number(ChainId.OPTIMISM_MAINNET_CHAIN_ID),
      Number(ChainId.FANTOM_MAINNET_CHAIN_ID),
    ];
  } else {
    return Object.values(ChainId).map((chainId) => Number(chainId));
  }
}

export default function () {
  const params = useParams();
  const { address: walletAddress } = useAccount();
  const address = params.address ?? walletAddress;
  const chainIds = getChainIds();

  if (address === undefined) {
    return null;
  }

  return (
    <>
      <Navbar roundUrlPath={"/"} showWalletInteraction={true} />
      <ViewContributionHistoryFetcher address={address} chainIds={chainIds} />;
    </>
  );
}
