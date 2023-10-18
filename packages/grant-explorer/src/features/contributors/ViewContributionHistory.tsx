import { useAccount } from "wagmi";
import { DetailedVote as Contribution } from "allo-indexer-client";
import {
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { lazy, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ethers } from "ethers";
import { PayoutToken } from "../api/types";
import { CHAINS, getChainIds, getTxExplorerTxLink } from "../api/utils";
import Navbar from "../common/Navbar";
const DonationHistoryBanner = lazy(
  () => import("../../assets/DonationHistoryBanner")
);
import blockies from "ethereum-blockies";
import CopyToClipboardButton from "../common/CopyToClipboardButton";
import Footer from "common/src/components/Footer";
import { payoutTokens } from "../api/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "common/src/styles";
import ReactTooltip from "react-tooltip";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";
import { useContributionHistory } from "../api/round";
import { StatCard } from "../common/StatCard";
import { ChainId } from "common";

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

function ViewContributionHistoryFetcher(props: {
  address: string;
  chainIds: number[];
}) {
  const contributionHistory = useContributionHistory(
    props.chainIds,
    props.address
  );

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: "Profile",
      path: `/contributors/${props.address}`,
    },
  ] as BreadcrumbItem[];

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
        breadCrumbs={breadCrumbs}
      />
    );
  } else {
    return (
      <ViewContributionHistory
        tokens={tokens}
        addressLogo={addressLogo}
        contributions={contributionHistory.data}
        address={props.address}
        breadCrumbs={breadCrumbs}
      />
    );
  }
}

export function ViewContributionHistory(props: {
  tokens: Record<string, PayoutToken>;
  contributions: { chainId: number; data: Contribution[] }[];
  address: string;
  addressLogo: string;
  ensName?: string;
  breadCrumbs: BreadcrumbItem[];
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

  const [activeRoundDonations] = useMemo(() => {
    const activeRoundDonations: { chainId: number; data: Contribution[] }[] =
      [];
    const now = Date.now();

    props.contributions.forEach((chainContribution) => {
      const { data } = chainContribution;
      const filteredRoundDonations = data.filter((contribution) => {
        const formattedRoundEndTime = contribution.roundEndTime * 1000;
        return formattedRoundEndTime >= now;
      });
      if (filteredRoundDonations.length > 0) {
        activeRoundDonations.push({
          chainId: chainContribution.chainId,
          data: filteredRoundDonations,
        });
      }
    });

    return [activeRoundDonations];
  }, [props.contributions]);

  const [pastRoundDonations] = useMemo(() => {
    const pastRoundDonations: { chainId: number; data: Contribution[] }[] = [];
    const now = Date.now();

    props.contributions.forEach((chainContribution) => {
      const { data } = chainContribution;
      const filteredRoundDonations = data.filter((contribution) => {
        const formattedRoundEndTime = contribution.roundEndTime * 1000;
        return formattedRoundEndTime < now;
      });
      if (filteredRoundDonations.length > 0) {
        pastRoundDonations.push({
          chainId: chainContribution.chainId,
          data: filteredRoundDonations,
        });
      }
    });

    return [pastRoundDonations];
  }, [props.contributions]);

  return (
    <div className="relative top-16 lg:mx-20 xl:mx-20 px-4 py-7 h-screen">
      <div className="flex flex-col pb-4" data-testid="bread-crumbs">
        <Breadcrumb items={props.breadCrumbs} />
      </div>
      <main>
        <div className="border-b pb-2 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-4"
              src={props.addressLogo}
              alt="Address Logo"
            />
            <div
              className="text-[18px] lg:text-[32px]"
              data-testid="contributor-address"
              title={props.address}
            >
              {props.ensName ||
                props.address.slice(0, 6) + "..." + props.address.slice(-6)}
            </div>
          </div>
          <CopyToClipboardButton
            textToCopy={`${currentOrigin}#/contributors/${props.address}`}
            styles="text-xs p-2"
            iconStyle="h-4 w-4 mr-1"
          />
        </div>
        <div className="text-2xl my-6">Donation Impact</div>
        <div className="grid grid-cols-2 grid-row-2 lg:grid-cols-3 lg:grid-row-1 gap-4">
          <div className="col-span-2 lg:col-span-1">
            <StatCard
              title="Total Donations"
              value={"$ " + totalDonations.toFixed(2).toString()}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="Contributions"
              value={totalUniqueContributions.toString()}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="Projects Funded"
              value={totalProjectsFunded.toString()}
            />
          </div>
        </div>
        <div className="text-2xl my-6">Donation History</div>
        <div className="text-lg bg-violet-100 text-black px-1 py-1 mb-2 font-semibold">
          Active Rounds
        </div>
        <DonationsTable
          contributions={activeRoundDonations}
          tokens={props.tokens}
          activeRound={true}
        />
        <div className="text-lg bg-grey-100 text-black px-1 py-1 mb-2 font-semibold">
          Past Rounds
        </div>
        <DonationsTable
          contributions={pastRoundDonations}
          tokens={props.tokens}
          activeRound={false}
        />
      </main>
      <div className="mt-24 mb-11 h-11">
        <Footer />
      </div>
    </div>
  );
}

export function ViewContributionHistoryWithoutDonations(props: {
  address: string;
  addressLogo: string;
  ensName?: string;
  breadCrumbs: BreadcrumbItem[];
}) {
  const currentOrigin = window.location.origin;
  const { address: walletAddress } = useAccount();
  return (
    <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen">
      <div className="flex flex-col pb-4" data-testid="bread-crumbs">
        <Breadcrumb items={props.breadCrumbs} />
      </div>
      <main>
        <div className="border-b pb-2 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-4"
              src={props.addressLogo}
              alt="Address Logo"
            />
            <div
              className="text-[18px] lg:text-[32px]"
              data-testid="contributor-address"
              title={props.address}
            >
              {props.ensName ||
                props.address.slice(0, 6) + "..." + props.address.slice(-6)}
            </div>
          </div>
          <CopyToClipboardButton
            textToCopy={`${currentOrigin}#/contributors/${props.address}`}
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
          <DonationHistoryBanner className="w-full h-auto object-cover rounded-t" />
        </div>
      </main>
      <div className="mt-24 mb-11 h-11">
        <Footer />
      </div>
    </div>
  );
}

function DonationsTable(props: {
  contributions: { chainId: ChainId; data: Contribution[] }[];
  tokens: Record<string, PayoutToken>;
  activeRound: boolean;
}) {
  return (
    <>
      <table
        className="border-collapse w-full"
        data-testid="donation-history-table"
      >
        <tr className="text-left text-lg">
          <th className="py-4 w-1/3 lg:w-1/2 font-medium">Project</th>
          <th className="flex flex-row py-4 w-1/3 lg:w-1/4 font-medium">
            <div className="py-4">Donation</div>
            <div className="py-4">
              <InformationCircleIcon
                data-tip
                data-background-color="#0E0333"
                data-for="donation-tooltip"
                className="inline h-4 w-4 ml-2 mr-3"
                data-testid={"donation-tooltip"}
              />
              <ReactTooltip
                id="donation-tooltip"
                place="bottom"
                type="dark"
                effect="solid"
              >
                <p className="text-xs">
                  The displayed amount in USD reflects <br />
                  the value at the time of your donation.
                </p>
              </ReactTooltip>
            </div>
          </th>
          <th className="py-4 text-right w-1/3 lg:w-1/4 font-medium">
            Transaction Information
          </th>
        </tr>
        {props.contributions.length > 0 &&
          props.contributions.map((chainContribution) => {
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
                  <td className="border-b py-4 pr-2 lg:pr-16 w-1/3 lg:w-1/2">
                    <div className="flex items-center">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex items-center">
                          <img
                            className="w-4 h-4 mr-2"
                            src={CHAINS[chainId]?.logo}
                            alt="Round Chain Logo"
                          />
                          <Link
                            className={`underline inline-block lg:pr-2 lg:max-w-[200px] max-w-[75px] 2xl:max-w-fit truncate`}
                            title={contribution.roundName}
                            to={`/round/${chainId}/${contribution.roundId.toLowerCase()}`}
                            target="_blank"
                          >
                            {contribution.roundName}
                          </Link>
                          <ChevronRightIcon className="h-4 inline lg:mx-2" />
                        </div>
                        <Link
                          className={`underline inline-block lg:pr-2 lg:max-w-[300px] max-w-[75px] 2xl:max-w-fit truncate`}
                          title={contribution.projectTitle}
                          to={`/round/${chainId}/${contribution.roundId.toLowerCase()}/${contribution.roundId.toLowerCase()}-${
                            contribution.applicationId
                          }`}
                          target="_blank"
                        >
                          {contribution.projectTitle}
                        </Link>
                      </div>
                    </div>
                    {/* Todo: display contribution timestamp */}
                    {/* <div className="text-sm text-gray-500">4 mins ago</div> */}
                  </td>
                  <td className="border-b py-4 truncate lg:pr-16 w-1/3 lg:w-1/4">
                    {formattedAmount}
                    <div className="text-md text-gray-500">
                      ${contribution.amountUSD.toFixed(2)}
                    </div>
                  </td>
                  <td className="border-b py-4 lg:pr-12 w-1/3 lg:w-1/4">
                    <div className="flex justify-end">
                      <TransactionButton
                        chainId={chainId}
                        txHash={contribution.transaction}
                      />
                    </div>
                  </td>
                </tr>
              );
            });
          })}
      </table>
      {props.contributions.length == 0 && (
        <div className="text-md mt-2 mb-12">
          {props.activeRound
            ? "Donations made during active rounds will appear here."
            : "Donations made during past rounds will appear here."}
        </div>
      )}
    </>
  );
}

export function TransactionButton(props: { chainId: number; txHash: string }) {
  return (
    <Button
      type="button"
      $variant="external-link"
      onClick={() =>
        window.open(getTxExplorerTxLink(props.chainId, props.txHash), "_blank")
      }
      className="flex flex-row text-gitcoin-violet-500 px-0"
    >
      <ArrowTopRightOnSquareIcon className="h-5 inline mx-2" />
      <div>View transaction</div>
    </Button>
  );
}
