import { useAccount, useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { lazy, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getChainIds, votingTokens } from "../api/utils";
import Navbar from "../common/Navbar";
import blockies from "ethereum-blockies";
import CopyToClipboardButton from "../common/CopyToClipboardButton";
import Footer from "common/src/components/Footer";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";
import { useContributionHistory } from "../api/round";
import { StatCard } from "../common/StatCard";
import { DonationsTable } from "./DonationsTable";
import { isAddress } from "viem";
import { VotingToken, dateToEthereumTimestamp } from "common";
import { Contribution } from "data-layer";

const DonationHistoryBanner = lazy(
  () => import("../../assets/DonationHistoryBanner")
);

export function ViewContributionHistoryPage() {
  const params = useParams();
  const chainIds = getChainIds();

  const { data: ensResolvedAddress } = useEnsAddress({
    /* If params.address is actually an address, don't resolve the ens address for it*/
    name: isAddress(params.address ?? "") ? undefined : params.address,
    chainId: 1,
  });

  if (params.address === undefined) {
    return null;
  }

  return (
    <>
      <Navbar showWalletInteraction={true} />
      <ViewContributionHistoryFetcher
        address={ensResolvedAddress ?? params.address}
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

  const { data: ensName } = useEnsName({
    /* If props.address is an ENS name, don't pass in anything, as we already have the ens name*/
    address: isAddress(props.address) ? props.address : undefined,
    chainId: 1,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    chainId: 1,
  });

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: "Donations",
      path: `/contributors/${props.address}`,
    },
  ] as BreadcrumbItem[];

  const addressLogo = useMemo(() => {
    return (
      ensAvatar ??
      blockies.create({ seed: props.address.toLowerCase() }).toDataURL()
    );
  }, [props.address, ensAvatar]);

  // tokens is a map of token address + chainId to token
  const tokens = Object.fromEntries(
    votingTokens.map((token) => [
      token.address.toLowerCase() + "-" + token.chainId,
      token,
    ])
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
        ensName={ensName}
      />
    );
  }
}

export function ViewContributionHistory(props: {
  tokens: Record<string, VotingToken>;
  contributions: { chainIds: number[]; data: Contribution[] };
  address: string;
  addressLogo: string;
  ensName?: string | null;
  breadCrumbs: BreadcrumbItem[];
}) {
  const currentOrigin = window.location.origin;
  const [totalDonations, totalUniqueContributions, totalProjectsFunded] =
    useMemo(() => {
      let totalDonations = 0;
      let totalUniqueContributions = 0;
      const projects: string[] = [];

      props.contributions.data.forEach((contribution) => {
        const tokenId =
          contribution.tokenAddress.toLowerCase() + "-" + contribution.chainId;
        const token = props.tokens[tokenId];
        if (token) {
          totalDonations += contribution.amountInUsd;
          totalUniqueContributions += 1;
          const project = contribution.projectId;
          if (!projects.includes(project)) {
            projects.push(project);
          }
        }
      });

      return [totalDonations, totalUniqueContributions, projects.length];
    }, [props.contributions, props.tokens]);

  const activeRoundDonations = useMemo(() => {
    const now = Date.now();

    const filteredRoundDonations = props.contributions.data.filter(
      (contribution) => {
        const formattedRoundEndTime =
          Number(
            dateToEthereumTimestamp(
              new Date(contribution.round.donationsEndTime)
            )
          ) * 1000;
        return formattedRoundEndTime >= now;
      }
    );
    if (filteredRoundDonations.length === 0) {
      return [];
    }
    return filteredRoundDonations;
  }, [props.contributions]);

  const pastRoundDonations = useMemo(() => {
    const now = Date.now();

    const filteredRoundDonations = props.contributions.data.filter(
      (contribution) => {
        const formattedRoundEndTime =
          Number(
            dateToEthereumTimestamp(
              new Date(contribution.round.donationsEndTime)
            )
          ) * 1000;
        return formattedRoundEndTime < now;
      }
    );
    if (filteredRoundDonations.length === 0) {
      return [];
    }

    return filteredRoundDonations;
  }, [props.contributions]);

  return (
    <div className="relative top-16 lg:mx-20 xl:mx-20 px-4 py-7 h-screen">
      <div className="flex flex-col pb-4" data-testid="bread-crumbs">
        <Breadcrumb items={props.breadCrumbs} />
      </div>
      <main>
        <div className="border-b pb-2 mb-4 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <img
              className="w-10 h-10 rounded-full mr-4 mt-2"
              src={props.addressLogo}
              alt="Address Logo"
            />
            <div
              className="text-lg lg:text-4xl"
              data-testid="contributor-address"
              title={props.address}
            >
              {props.ensName ||
                props.address.slice(0, 6) + "..." + props.address.slice(-6)}
            </div>
          </div>
          <div className="flex justify-between items-center">
            {/* todo: removed until site is stable */}
            {/* <Button
              className="shadow-sm inline-flex border-gray-300 border-2 bg-gradient-to-br from-[#f6d7caff] via-[#bddce8ff] to-[#ebdfa5ff] font-medium py-2 px-4 rounded-md hover:bg-gradient-to-tr text-black w-30 mr-6"
              onClick={() =>
                window.open(
                  `https://gg-your-impact.streamlit.app/?address=${props.address}`,
                  "_blank"
                )
              }
            >
              <span className="font-mono text-black text-opacity-100">
                Your Gitcoin Grants Impact
              </span>
            </Button> */}
            <CopyToClipboardButton
              textToCopy={`${currentOrigin}/#/contributors/${props.address}`}
              iconStyle="h-4 w-4 mr-1 mt-1 shadow-sm"
            />
          </div>
        </div>
        <div className="mt-8 mb-2 font-sans italic">
          * Please note that your recent transactions may take a short while to
          reflect in your donation history, as processing times may vary.
        </div>
        <div className="text-2xl my-6 font-sans">Donation Impact</div>
        <div className="grid grid-cols-2 grid-row-2 lg:grid-cols-3 lg:grid-row-1 gap-6">
          <div className="col-span-2 lg:col-span-1">
            <StatCard
              title="Total Donations"
              value={"$" + totalDonations.toFixed(2).toString()}
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
        <div className="text-lg bg-grey-75 text-black rounded-2xl pl-4 px-1 py-1 mb-2 font-semibold">
          Active Rounds
        </div>
        <DonationsTable
          contributions={activeRoundDonations}
          tokens={props.tokens}
          activeRound={true}
        />
        <div className="text-lg bg-grey-75 text-black rounded-2xl pl-4 px-1 py-1 mb-2 font-semibold">
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
            textToCopy={`${currentOrigin}/#/contributors/${props.address}`}
            styles="text-xs p-2"
            iconStyle="h-4 w-4 mr-1"
          />
        </div>
        <div className="text-2xl">Donation History</div>
        <div className="flex justify-center">
          <div className="w-3/4 my-6 text-center mx-auto">
            {props.address === walletAddress ? (
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
