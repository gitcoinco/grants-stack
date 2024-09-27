import { useAccount, useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { lazy, useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import blockies from "ethereum-blockies";
import CopyToClipboardButton from "../common/CopyToClipboardButton";
import Footer from "common/src/components/Footer";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";
import { useContributionHistory } from "../api/round";
import { StatCard } from "../common/StatCard";
import { DonationsTable } from "./DonationsTable";
import { Hex, isAddress } from "viem";
import {
  dateToEthereumTimestamp,
  getChains,
  getTokenByChainIdAndAddress,
} from "common";
import { Contribution } from "data-layer";
import { normalize } from "viem/ens";
import { DirectDonationsTable } from "./DirectDonationsTable";

const DonationHistoryBanner = lazy(
  () => import("../../assets/DonationHistoryBanner")
);

export function ViewContributionHistoryPage() {
  const params = useParams();
  const chainIds = getChains().map((chain) => chain.id);

  const { data: ensResolvedAddress } = useEnsAddress({
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
  console.log("contributions", contributionHistory);

  const { data: ensName } = useEnsName({
    /* If props.address is an ENS name, don't pass in anything, as we already have the ens name*/
    address: isAddress(props.address) ? props.address : undefined,
    chainId: 1,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
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

  if (contributionHistory.type === "loading") {
    return <div>Loading...</div>;
  } else if (contributionHistory.type === "error") {
    console.error("Error", contributionHistory);
    return (
      <ViewNoHistory
        address={props.address}
        addressLogo={addressLogo}
        breadCrumbs={breadCrumbs}
      />
    );
  } else {
    return (
      <ViewContributionHistory
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
        const token = getTokenByChainIdAndAddress(
          contribution.chainId,
          contribution.tokenAddress as Hex
        );

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
    }, [props.contributions]);

  const filteredDonations = useMemo(() => {
    const now = Date.now();
  
    const getFilteredDonations = (type: string) => {
      return props.contributions.data.filter((contribution) => {
        const formattedRoundEndTime =
          Number(
            dateToEthereumTimestamp(new Date(contribution.round.donationsEndTime))
          ) * 1000;
  
        switch (type) {
          case "active":
            return (
              formattedRoundEndTime >= now &&
              contribution.round.strategyName !== "allov2.DirectAllocationStrategy"
            );
          case "past":
            return (
              formattedRoundEndTime < now &&
              contribution.round.strategyName !== "allov2.DirectAllocationStrategy"
            );
          case "direct":
            return contribution.round.strategyName === "allov2.DirectAllocationStrategy";
          default:
            return false;
        }
      });
    };
  
    return {
      activeRoundDonations: getFilteredDonations("active"),
      pastRoundDonations: getFilteredDonations("past"),
      directAllocationDonations: getFilteredDonations("direct"),
    };
  }, [props.contributions]);

  return (
    <div className="relative top-16 lg:mx-20 xl:mx-20 px-4 py-7 h-screen">
      <div className="flex flex-col pb-4" data-testid="bread-crumbs">
        <Breadcrumb items={props.breadCrumbs} />
      </div>
      <main>
        <div className="pb-2 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <img
              className="w-10 h-10 rounded-full mr-4 my-auto"
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
            <CopyToClipboardButton
              textToCopy={`${currentOrigin}/#/contributors/${props.address}`}
              iconStyle="w-3.5 mr-1 mt-1 shadow-sm"
            />
          </div>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          Please note that your recent transactions may take a short while to
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
        <div className="text-2xl mt-6 mb-10">Donation History</div>
        <div className="border-black mb-2 px-1 py-1 text-black text-lg border-b font-semibold">
          Active Rounds
        </div>
        <DonationsTable
          contributions={filteredDonations.activeRoundDonations}
          activeRound={true}
        />
        <div className="border-black mb-2 px-1 py-1 text-black text-lg border-b font-semibold">
          Past Rounds
        </div>
        <DonationsTable
          contributions={filteredDonations.pastRoundDonations}
          activeRound={false}
        />
        {/* Direct Allocation */}
        {filteredDonations.directAllocationDonations.length > 0 && (
          <>
            <div className="border-black mb-2 px-1 py-1 text-black text-lg border-b font-semibold">
              Direct Donations
            </div>
            <DirectDonationsTable contributions={filteredDonations.directAllocationDonations} />
          </>
        )
      }
      </main>
      <div className="mt-24 mb-11 h-11">
        <Footer />
      </div>
    </div>
  );
}

export function ViewNoHistory(props: {
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
