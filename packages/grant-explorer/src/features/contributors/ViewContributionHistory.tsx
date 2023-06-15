import { useAccount } from "wagmi";
import {
  Client as AlloIndexerClient,
  DetailedVote as Contribution,
} from "allo-indexer-client";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { PayoutToken } from "../api/types";
import { CHAINS } from "../api/utils";
import Navbar from "../common/Navbar";
import { ReactComponent as DonationHistoryBanner } from "../../assets/donnation-history-banner.svg";
import { ChainId } from "../api/utils";
import blockies from "ethereum-blockies";
import CopyToClipboardButton from "../common/CopyToClipboardButton";
import Footer from "common/src/components/Footer";
import { payoutTokens } from "../api/utils";

type ContributionHistoryState =
  | { type: "loading" }
  | {
      type: "loaded";
      data: { chainId: number; data: Contribution[] }[];
    }
  | { type: "error"; error: string };

const useContributionHistory = (chainIds: number[], rawAddress: string) => {
  const [state, setState] = useState<ContributionHistoryState>({
    type: "loading",
  });

  useEffect(() => {
    if (!process.env.REACT_APP_ALLO_API_URL) {
      throw new Error("REACT_APP_ALLO_API_URL is not set");
    }

    const fetchContributions = async () => {
      const fetchPromises: Promise<{
        chainId: number;
        data: Contribution[];
        error?: string;
      }>[] = chainIds.map((chainId: number) => {
        if (!process.env.REACT_APP_ALLO_API_URL) {
          throw new Error("REACT_APP_ALLO_API_URL is not set");
        }

        const client = new AlloIndexerClient(
          fetch.bind(window),
          process.env.REACT_APP_ALLO_API_URL,
          chainId
        );

        let address = "";
        try {
          // ensure the address is a valid address
          address = ethers.utils.getAddress(rawAddress.toLowerCase());
        } catch (e) {
          return Promise.resolve({
            chainId,
            error: "Invalid address",
            data: [],
          });
        }

        return client
          .getContributionsByAddress(address)
          .then((data) => {
            return { chainId, error: undefined, data };
          })
          .catch((error) => {
            console.log(
              `Error fetching contribution history for chain ${chainId}:`,
              error
            );
            return { chainId, error: error.toString() as string, data: [] };
          });
      });

      const fetchResults = await Promise.all(fetchPromises);

      if (fetchResults.every((result) => result.error)) {
        setState({
          type: "error",
          error: "Error fetching contribution history for all chains",
        });
      } else {
        setState({ type: "loaded", data: fetchResults });
      }
    };

    fetchContributions();
  }, [chainIds, rawAddress]);

  return state;
};

function StatCard(props: { title: string; value: string | undefined }) {
  return (
    <div className="rounded border border-violet-400 p-4 flex-grow">
      <div className="font-bold text-md pb-4">{props.title}</div>
      <div className="text-grey-400 text-2xl">{props.value}</div>
    </div>
  );
}

export function ViewContributionHistoryDisplay(props: {
  tokens: Record<string, PayoutToken>;
  contributions: { chainId: number; data: Contribution[] }[];
  address: string;
  addressLogo: string;
  ensName?: string;
}) {
  const currentOrigin = window.location.origin;

  const [totalDonations, totalUniqueContributions, totalProjectsFunded] =
    useMemo(() => {
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

      return [totalDonations, totalUniqueContributions, projects.length];
    }, [props.contributions, props.tokens]);

  return (
    <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen">
      <main>
        <div className="border-b pb-2 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-4"
              src={props.addressLogo}
              alt="Address Logo"
            />
            <div
              className="text-[32px]"
              data-testid="profile-address"
              title={props.address}
            >
              {props.ensName ||
                props.address.slice(0, 6) + "..." + props.address.slice(-6)}
            </div>
          </div>
          <CopyToClipboardButton
            textToCopy={`${currentOrigin}#/profile/${props.address}`}
            styles="text-xs p-2"
            iconStyle="h-4 w-4 mr-1"
          />
        </div>
        <div className="text-2xl">Donation Impact</div>
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
        <div className="text-2xl my-4">Donation History</div>
        <div className="text-lg bg-violet-100 text-black px-1 py-1">
          All Rounds
        </div>
        <table
          className="border-collapse w-full"
          data-testid="donation-history-table"
        >
          <tr className="text-left text-lg">
            <th className="py-4">Project</th>
            <th className="py-4">Donation</th>
            <th className="py-4">Transaction information</th>
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
                  <td className="border-b py-4 pr-16>">
                    <div className="flex items-center">
                      <div>
                        <img
                          className="w-4 h-4 mr-2"
                          src={CHAINS[chainId]?.logo}
                          alt="Round Chain Logo"
                        />
                      </div>
                      {/*ToDo: add links to the round name & project */}
                      <div
                        className="inline-block max-2-[200px] truncate"
                        title={contribution.roundName}
                      >
                        {contribution.roundName}
                      </div>
                      <ChevronRightIcon className="h-4 inline mx-2" />
                      <div
                        className="inline-block max-w-[300px] truncate"
                        title={contribution.projectTitle}
                      >
                        {contribution.projectTitle}
                      </div>
                    </div>
                    {/* Todo: display contribution timestamp */}
                    {/* <div className="text-sm text-gray-500">4 mins ago</div> */}
                  </td>
                  <td className="border-b py-4 max-w-[150px] truncate pr-16">
                    {formattedAmount}
                    <div className="text-md text-gray-500">
                      ${contribution.amountUSD.toFixed(2)}
                    </div>
                  </td>
                  <td className="border-b py-4 max-w-[300px] truncate">
                    {contribution.transaction}
                  </td>
                </tr>
              );
            });
          })}
        </table>
      </main>
      <div className="my-11 h-11">
        <Footer />
      </div>
    </div>
  );
}

export function ViewContributionHistoryWithoutDonations(props: {
  address: string;
  addressLogo: string;
  ensName?: string;
}) {
  const currentOrigin = window.location.origin;
  const { address: walletAddress } = useAccount();
  return (
    <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen">
      <main>
        <div className="border-b pb-2 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-4"
              src={props.addressLogo}
              alt="Address Logo"
            />
            <div
              className="text-[32px]"
              data-testid="profile-address"
              title={props.address}
            >
              {props.ensName ||
                props.address.slice(0, 6) + "..." + props.address.slice(-6)}
            </div>
          </div>
          <CopyToClipboardButton
            textToCopy={`${currentOrigin}#/profile/${props.address}`}
            styles="text-xs p-2"
            iconStyle="h-4 w-4 mr-1"
          />
        </div>
        <div className="text-2xl">Donation History</div>
        <div className="flex justify-center">
          <div className="w-3/4 my-6 text-center mx-auto">
            {props.address == walletAddress ? (
              <>
                <p className="text-md">
                  This is your donation history page, where you can keep track
                  of all the public goods you've funded.
                </p>
                <p className="text-md">
                  As you make donations, your transaction history will appear
                  here.
                </p>
              </>
            ) : (
              <>
                <p className="text-md">
                  This is{" "}
                  {props.ensName ||
                    props.address.slice(0, 6) + "..." + props.address.slice(-6)}
                  ’s donation history page, showcasing their contributions
                  towards public goods.
                </p>
                <p className="text-md">
                  As they make donations, their transaction history will appear
                  here.
                </p>
              </>
            )}
            <div />
          </div>
        </div>
        <div className="flex justify-center">
          {" "}
          <DonationHistoryBanner />
        </div>
      </main>
      <div className="my-11 h-11">
        <Footer />
      </div>
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

  const addressLogo = useMemo(() => {
    return blockies.create({ seed: props.address.toLowerCase() }).toDataURL();
  }, [props.address]);

  const tokens = Object.fromEntries(
    payoutTokens.map((token) => [token.address, token])
  );

  if (contributionHistory.type === "loading") {
    return <div>Loading...</div>;
  } else if (contributionHistory.type === "error") {
    console.error("Error", contributionHistory);
    return (
      <ViewContributionHistoryWithoutDonations
        address={props.address}
        addressLogo={addressLogo}
      />
    );
  } else {
    return (
      <ViewContributionHistoryDisplay
        tokens={tokens}
        addressLogo={addressLogo}
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
  const chainIds = getChainIds();

  if (params.address === undefined) {
    return null;
  }

  return (
    <>
      <Navbar roundUrlPath={"/"} showWalletInteraction={true} />
      <ViewContributionHistoryFetcher
        address={params.address}
        chainIds={chainIds}
      />
    </>
  );
}
