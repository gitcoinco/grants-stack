import { datadogLogs } from "@datadog/browser-logs";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  merklePayoutStrategyImplementationContract,
  roundImplementationContract,
} from "common/src/contracts";
import { ChainId, formatDateWithOrdinal, useTokenPrice } from "common";
import { Button } from "common/src/styles";
import { ReactComponent as TwitterBlueIcon } from "../../assets/twitter-blue-logo.svg";
import { useRoundById } from "../../context/RoundContext";
import { Project, Round, VotingToken } from "../api/types";
import {
  __deprecated_fetchFromIPFS,
  isInfiniteDate,
  votingTokens,
} from "../api/utils";
import NotFoundPage from "../common/NotFoundPage";
import { Spinner } from "../common/Spinner";
import { useToken } from "wagmi";
import { getAddress } from "viem";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import Plot from "react-plotly.js";
import { BigNumber, ethers } from "ethers";
import * as Papa from "papaparse";
import { UnparseObject } from "papaparse";
import GenericModal from "../common/GenericModal";
import { getEnabledChains } from "../../app/chainConfig";
import { BaseProvider } from "@ethersproject/providers";
import { DefaultLayout } from "../common/DefaultLayout";
import ViewRoundPageHero from "./ViewRoundPageHero";
import ViewRoundPageTabs from "./ViewRoundPageTabs";
import BeforeRoundStart from "./BeforeRoundStart";
import { Application, useDataLayer } from "data-layer";
import { useRoundApprovedApplications } from "../projects/hooks/useRoundApplications";
import { useRoundUniqueDonorsCount } from "../projects/hooks/useRoundUniqueDonorsCount";

export type MatchingStatsData = {
  index?: number;
  projectName: string;
  uniqueContributorsCount?: number;
  contributionsCount: number;
  matchPoolPercentage: number;
  projectId: string;
  applicationId: string;
  matchAmountInToken: BigNumber;
  originalMatchAmountInToken: BigNumber;
  projectPayoutAddress: string;
  status?: string;
  hash?: string;
};

export type ProjectMatchingData = MatchingStatsData & {
  matchAmountUSD?: number;
};

type ApplicationWithMatchingData = Application & {
  matchingData?: ProjectMatchingData;
};

export default function ViewRoundStats() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId/stats");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  const { round, isLoading } = useRoundById(
    Number(chainId),
    roundId?.toLowerCase() as string
  );

  const currentTime = new Date();
  const isBeforeRoundStartDate = round && round.roundStartTime >= currentTime;
  const isAfterRoundStartDate = round && round.roundStartTime <= currentTime;

  return isLoading ? (
    <Spinner text="We're fetching the Round." />
  ) : (
    <>
      {round && chainId && roundId ? (
        <>
          {isBeforeRoundStartDate && (
            <BeforeRoundStart
              round={round}
              chainId={chainId}
              roundId={roundId}
            />
          )}

          {isAfterRoundStartDate && (
            <AfterRoundStart
              round={round}
              chainId={Number(chainId)}
              roundId={roundId}
            />
          )}
        </>
      ) : (
        <NotFoundPage />
      )}
    </>
  );
}

function AfterRoundStart(props: {
  round: Round;
  chainId: ChainId;
  roundId: string;
}) {
  const { round, chainId, roundId } = props;

  // covers infinte dates for roundEndDate
  const currentTime = new Date();
  const isAfterRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime)
      ? false
      : round && round.roundEndTime <= currentTime);
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime) || round.roundEndTime > currentTime);

  const [projects, setProjects] = useState<Project[]>();

  useEffect(() => {
    const projects = round?.approvedProjects;
    setProjects(projects);
  }, [round]);

  const { data } = useToken({
    address: getAddress(props.round.token),
    chainId: Number(props.chainId),
  });

  const nativePayoutToken = votingTokens.find(
    (t) =>
      t.chainId === Number(props.chainId) &&
      t.address === getAddress(props.round.token)
  );

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.name ?? "ETH",
  };
  const tokenSymbol = tokenData.symbol;

  return (
    <>
      <DefaultLayout>
        <div>
          <ViewRoundPageHero
            round={round}
            chainId={chainId}
            roundId={roundId}
            isBeforeRoundEndDate={isBeforeRoundEndDate}
            isAfterRoundEndDate={isAfterRoundEndDate}
            tokenSymbol={tokenData?.symbol}
          />

          <div className="mb-10">
            <ViewRoundPageTabs
              round={round}
              chainId={chainId}
              roundId={roundId}
              isBeforeRoundEndDate={isBeforeRoundEndDate}
              projectsCount={round?.approvedProjects?.length ?? 0}
            />
          </div>
          <>
            <ReportCard
              projects={projects}
              token={nativePayoutToken}
              tokenSymbol={tokenSymbol}
              isBeforeRoundEndDate={isBeforeRoundEndDate}
              roundId={roundId}
              round={round}
              chainId={chainId}
            />
          </>
        </div>
      </DefaultLayout>
    </>
  );
}

const ReportCard = ({
  round,
  roundId,
  chainId,
  token,
  tokenSymbol,
  projects,
}: {
  projects?: Project[];
  token?: VotingToken;
  tokenSymbol?: string;
  isBeforeRoundEndDate?: boolean;
  roundId: string;
  round: Round;
  chainId: ChainId;
}): JSX.Element => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const dataLayer = useDataLayer();

  const { data: uniqueDonorsCount } = useRoundUniqueDonorsCount(
    { chainId, roundId },
    dataLayer
  );

  const { data: applications, isLoading: isGetApplicationsLoading } =
    useRoundApprovedApplications(
      {
        chainId,
        roundId,
        projectIds: round.approvedProjects?.map(
          (proj) => proj.grantApplicationId.split("-")[1]
        ),
      },
      dataLayer
    );
  const { matchingData } = useFetchMatchingDistributionFromContract(
    roundId,
    chainId
  );

  const totalDonors: number = useMemo(() => {
    return !uniqueDonorsCount ? 0 : uniqueDonorsCount.uniqueDonorsCount;
  }, [uniqueDonorsCount]);

  const { data: tokenPrice } = useTokenPrice(token?.redstoneTokenId);

  const applicationsWithMetadataAndMatchingData:
    | ApplicationWithMatchingData[]
    | undefined = useMemo(() => {
    if (!applications || !projects) return;

    const tokenAmount =
      round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable ?? 0;

    const matchingPoolUSD = Number(tokenPrice) * tokenAmount;

    const applicationsWithData = applications.map((application) => {
      const projectMatchingData = matchingData?.find(
        (match) => match.applicationId === application.id
      );

      const projectMatchUSD = projectMatchingData?.matchPoolPercentage
        ? projectMatchingData.matchPoolPercentage * matchingPoolUSD
        : 0;

      const applicationData = {
        ...application,
        matchingData: projectMatchingData
          ? {
              ...projectMatchingData,
              matchAmountUSD: projectMatchUSD,
            }
          : (undefined as ProjectMatchingData | undefined),
      };
      return applicationData;
    });

    const sortedApplications = [...applicationsWithData].sort((a, b) => {
      const totalA = a.matchingData
        ? a.matchingData?.matchAmountUSD ?? 0
        : a.totalAmountDonatedInUsd;
      const totalB = b.matchingData
        ? b.matchingData?.matchAmountUSD ?? 0
        : b.totalAmountDonatedInUsd;
      return totalB - totalA;
    });
    return sortedApplications;
  }, [
    applications,
    projects,
    matchingData,
    round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable,
    tokenPrice,
  ]);

  const projectsMatchAmountInToken =
    applicationsWithMetadataAndMatchingData?.map((application) =>
      application.matchingData
        ? parseFloat(
            ethers.utils.formatUnits(
              application.matchingData?.matchAmountInToken ?? 0,
              token?.decimal
            )
          )
        : 0
    ) ?? [];

  const totalUSDCrowdfunded = useMemo(() => {
    return (
      applications
        ?.map((application) => application.totalAmountDonatedInUsd)
        .reduce((acc, amount) => acc + amount, 0) ?? 0
    );
  }, [applications]);

  const totalDonations = useMemo(() => {
    return (
      applications
        ?.map((application) => application.uniqueDonorsCount)
        .reduce((acc, amount) => acc + amount, 0) ?? 0
    );
  }, [applications]);

  const roundPreamble =
    "Celebrate the impact of recent Gitcoin rounds through data, insights, and stories of participating grant projects and individuals. Our visual report cards highlight achievements, foster transparency, and track engagement in the open-source community.";

  function downloadProjectsCSV() {
    if (!applicationsWithMetadataAndMatchingData) return;
    const data = createApplicationsCSV(applicationsWithMetadataAndMatchingData);
    const csvData = Papa.unparse(
      data as unknown as unknown[] | UnparseObject<unknown>
    );
    const fileName = `${round.roundMetadata?.name} - Round Results.csv`;
    exportData(csvData, fileName, "text/csv;charset=utf-8;");
  }

  const exportData = (data: BlobPart, fileName: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const createApplicationsCSV = (
    applications: ApplicationWithMatchingData[]
  ) => {
    const tokenFieldName = `MATCHED ${token?.name}`;

    const list = applications.map((proj, index) => {
      const tokenAmount = proj.matchingData
        ? parseFloat(
            ethers.utils.formatUnits(
              proj.matchingData.matchAmountInToken,
              token?.decimal
            )
          )
        : 0;
      return {
        RANK: index + 1,
        "PROJECT NAME": proj.project?.metadata?.title ?? "-",
        CONTRIBUTIONS: formatAmount(proj.uniqueDonorsCount, true),
        "CROWDFUNDED USD": `$${formatAmount(
          proj.totalAmountDonatedInUsd?.toFixed(2)
        )}`,
        "MATCHED USD": `$${formatAmount(
          (proj.matchingData?.matchAmountUSD ?? 0).toFixed(2)
        )}`,
        [tokenFieldName]: `${formatAmount(tokenAmount, true)} ${tokenSymbol}`,
      };
    });
    return JSON.stringify(list);
  };

  const ShareModal = () => {
    const ShareModalBody = () => (
      <div>
        <TwitterButton round={round} />
      </div>
    );

    return (
      <GenericModal
        title="Share"
        body={<ShareModalBody />}
        isOpen={isShareModalOpen}
        setIsOpen={setIsShareModalOpen}
      />
    );
  };

  return (
    <section className="flex flex-col gap-10 sm:gap-16">
      <div className="w-full">
        {/* <div className="flex justify-end">
          <ShareStatsButton handleClick={() => setIsShareModalOpen(true)} />
        </div> */}
        <div className="max-w-3xl w-full m-auto">
          <h2 className="md:text-3xl text-2xl mb-8 flex items-center gap-4 font-modern-era-medium tracking-tighter">
            Round stats
          </h2>

          <p className="whitespace-pre-line break-words text-grey-500 font-modern-era-medium">
            {roundPreamble}
          </p>
        </div>
      </div>

      <Stats
        token={token}
        tokenSymbol={tokenSymbol}
        round={round}
        projectsMatchAmountInToken={projectsMatchAmountInToken}
        totalCrowdfunded={totalUSDCrowdfunded}
        totalDonations={totalDonations}
        totalDonors={totalDonors}
        totalProjects={applications?.length ?? 0}
        chainId={chainId}
        statsLoading={isGetApplicationsLoading}
      />

      {!!applicationsWithMetadataAndMatchingData && !!totalUSDCrowdfunded && (
        <div>
          <ProjectsPlot
            applications={applicationsWithMetadataAndMatchingData}
          />
          <aside className="flex flex-col items-center gap-2">
            <button className="underline" onClick={downloadProjectsCSV}>
              Download the full funding results.
            </button>
            <p className="text-center">
              Please note results are going through ratification in our
              governance process.
            </p>
          </aside>
        </div>
      )}

      {!!applicationsWithMetadataAndMatchingData && !!totalUSDCrowdfunded && (
        <RoundLeaderboard
          applications={applicationsWithMetadataAndMatchingData}
        />
      )}

      {/* <div className="max-w-4xl m-auto w-full bg-green-50 rounded-2xl py-8 px-2 flex justify-center items-center gap-5 flex-wrap">
        <p className="text-2xl">Share the results</p>
        <ShareStatsButton handleClick={() => setIsShareModalOpen(true)} />
      </div> */}

      <ShareModal />
    </section>
  );
};

const Stats = ({
  round,
  totalCrowdfunded,
  totalProjects,
  // matching value by projects
  projectsMatchAmountInToken,
  token,
  tokenSymbol,
  totalDonations,
  totalDonors,
  statsLoading,
}: {
  round: Round;
  totalCrowdfunded: number;
  totalProjects: number;
  projectsMatchAmountInToken: number[];
  chainId: number;
  token?: VotingToken;
  tokenSymbol?: string;
  totalDonations: number;
  totalDonors: number;
  statsLoading: boolean;
}): JSX.Element => {
  const tokenAmount =
    round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable ?? 0;

  const { data: poolTokenPrice } = useTokenPrice(token?.redstoneTokenId);

  const matchingPoolUSD = poolTokenPrice
    ? Number(poolTokenPrice) * tokenAmount
    : undefined;
  const matchingCapPercent =
    round.roundMetadata?.quadraticFundingConfig?.matchingCapAmount ?? 0;
  const matchingCapTokenValue = (tokenAmount * matchingCapPercent) / 100;
  const projectsReachedMachingCap: number =
    projectsMatchAmountInToken?.filter(
      (amount) => amount >= matchingCapTokenValue
    )?.length ?? 0;

  return (
    <div className="max-w-6xl m-auto w-full">
      <div
        className={`${
          matchingCapPercent ? "xl:grid-cols-4" : "xl:grid-cols-3"
        } grid grid-cols-2 gap-2 sm:gap-4`}
      >
        <StatCard
          statValue={`${formatAmount(tokenAmount, true)} ${tokenSymbol} \n\n
            ${
              matchingPoolUSD ? `($${formatAmount(matchingPoolUSD ?? 0)})` : ""
            }`}
          statName="Matching Pool"
          isValueLoading={statsLoading}
        />
        <StatCard
          statValue={`$${formatAmount(totalCrowdfunded.toFixed(2))}`}
          statName="Total USD Crowdfunded"
          isValueLoading={statsLoading}
        />
        {!!matchingCapPercent && (
          <StatCard
            statValue={`${matchingCapPercent.toFixed()}%  \n\n (${formatAmount(
              matchingCapTokenValue,
              true
            )} ${tokenSymbol})`}
            statName="Matching Cap"
            isValueLoading={statsLoading}
          />
        )}
        {!!round.roundEndTime && (
          <StatCard
            statValue={formatDateWithOrdinal(new Date(round.roundEndTime ?? 0))}
            statName={
              new Date() > new Date(round.roundEndTime)
                ? "Round ended on"
                : "Round ends on"
            }
            isValueLoading={statsLoading}
          />
        )}
        <StatCard
          statValue={formatAmount(totalProjects, true)}
          statName="Total Projects"
          isValueLoading={statsLoading}
        />

        <StatCard
          statValue={formatAmount(totalDonations, true)}
          statName="Total Donations"
          isValueLoading={statsLoading}
        />
        <StatCard
          statValue={formatAmount(totalDonors, true)}
          statName="Total Donors"
          isValueLoading={statsLoading}
        />
        {!!matchingCapPercent && (
          <StatCard
            statValue={projectsReachedMachingCap.toString()}
            statName={`${
              projectsReachedMachingCap === 1 ? "Project" : "Projects"
            } Reaching Matching Cap`}
            isValueLoading={statsLoading}
          />
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  statValue,
  statName,
  isValueLoading,
}: {
  statValue: string;
  statName: string;
  isValueLoading?: boolean;
}): JSX.Element => {
  return (
    <div className="bg-grey-50 p-4 sm:p-6 rounded-2xl flex flex-col justify-between w-full">
      {isValueLoading ? (
        <div className="w-[80%] rounded text-5 sm:h-9 mb-4 bg-grey-200 animate-pulse" />
      ) : (
        <p className="text-xl sm:text-3xl pb-4 font-mono prose tracking-tighter">
          {statValue}
        </p>
      )}

      <p className="text-sm text-grey-400 font-bold max-w-[20ch]">{statName}</p>
    </div>
  );
};

const ProjectsPlot = ({
  applications,
}: {
  applications: ApplicationWithMatchingData[];
}): JSX.Element => {
  const { width } = useWindowDimensions();

  const labelsAndValues = useMemo(() => {
    const amounts: number[] = [];
    const projectNames: string[] = [];
    const parents: string[] = [];

    applications?.forEach((application) => {
      const totalReceived =
        (application.matchingData?.matchAmountUSD ?? 0) +
        application.totalAmountDonatedInUsd;
      amounts.push(totalReceived);

      const projectName = application.project?.metadata?.title;

      projectNames.push(
        `${
          projectName
            ? `${projectName.slice(0, 20)}${
                projectName.length >= 20 ? "..." : ""
              }`
            : "-"
        } `
      );
      parents.push("");
    });

    return { amounts, projectNames, parents };
  }, [applications]);

  const colors = [
    "#FCD661",
    "#645AD8",
    "#FFC2EE",
    "#25BDCE",
    "#5F94BC",
    "#B3DE9F",
    "#FF9776",
    "#FFEFBE",
    "#D9D6FF",
    "#FFE5F8",
    "#C8F6F6",
    "#D3EDFE",
    "#DBF0DB",
    "#FFD9CE",
    "#FBC624",
    "#6935FF",
    "#FF00B8",
    "#73E2E2",
    "#15B8DC",
    "#248B5A",
    "#FF7043",
  ];

  useEffect(() => {
    window.matchMedia("(min-width: 37.5rem)").matches
      ? setLayout({
          font: { size: 18 },
          showlegend: false,
          displayModeBar: false,
          margin: {
            t: 30,
            b: 25,
            l: 0,
            r: 0,
            pad: 0,
          },
          width: undefined,
          scene: {
            xaxis: {
              spikecolor: "#1fe5bd",
              spikesides: false,
              spikethickness: 6,
            },
            yaxis: {
              spikecolor: "#1fe5bd",
              spikesides: false,
              spikethickness: 6,
            },
            zaxis: {
              spikecolor: "#1fe5bd",
              spikethickness: 6,
            },
          },
        })
      : setLayout({
          font: { size: 18 },
          showlegend: false,
          displayModeBar: false,
          margin: { t: 10, b: 25, l: 0, r: 0, pad: 0 },
          width: width - 120,
          scene: {
            xaxis: {
              spikecolor: "#1fe5bd",
              spikesides: false,
              spikethickness: 6,
            },
            yaxis: {
              spikecolor: "#1fe5bd",
              spikesides: false,
              spikethickness: 6,
            },
            zaxis: {
              spikecolor: "#1fe5bd",
              spikethickness: 6,
            },
          },
        });
  }, [width]);

  const [layout, setLayout] = useState({
    font: { size: 18 },
    showlegend: false,
    displayModeBar: false,
    margin: { t: 30, b: 25, l: 0, r: 0, pad: 0 },
    width: undefined as number | undefined,
    scene: {
      xaxis: {
        spikecolor: "#1fe5bd",
        spikesides: false,
        spikethickness: 6,
      },
      yaxis: {
        spikecolor: "#1fe5bd",
        spikesides: false,
        spikethickness: 6,
      },
      zaxis: {
        spikecolor: "#1fe5bd",
        spikethickness: 6,
      },
    },
  });

  return (
    <div className="bg-sand w-full max-w-4xl m-auto">
      <Plot
        className={`!bg-sand w-full [&_*]:!mx-auto color-sand ![&_*]:bg-sand [&_*]:max-w-[${
          width - 50
        }px] max-w-[${width - 50}px]`}
        data={[
          {
            type: "treemap",
            labels: labelsAndValues.projectNames,
            parents: labelsAndValues.parents,
            values: labelsAndValues.amounts,
            text: labelsAndValues.amounts.map(
              (value) => `$${formatAmount(value.toFixed(2))}`
            ),
            textinfo: "label+text",
            // @ts-expect-error - docs include "label+text" option
            hoverinfo: "label+text",
            title: { text: "label" },
            mode: "markers",
            textfont: { size: 18 },
            marker: {
              line: { width: 2 },

              colors,
            },
          },
        ]}
        layout={layout}
      />
    </div>
  );
};

const RoundLeaderboard = ({
  applications,
}: {
  applications: ApplicationWithMatchingData[];
}): JSX.Element => {
  return (
    <div className="max-w-4xl w-full m-auto px-6 py-12 md:p-12 bg-grey-50 rounded-[2rem]">
      <div className="mb-10 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:flex-row flex-col">
        <h2 className="text-center m-auto md:text-3xl text-2xl font-modern-era-medium tracking-tighter">
          Leaderboard
        </h2>
      </div>
      <div className="overflow-x-auto max-w-[85vw]">
        <div className="flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead className="text-left text-sm font-semibold uppercase">
                  <tr>
                    <th scope="col" className="py-3 pl-4 pr-3">
                      Rank
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Project name
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Contributions
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Crowdfunded USD
                    </th>
                    <th scope="col" className="relative py-3 pl-3 pr-4">
                      Matched USD
                    </th>
                  </tr>
                </thead>
                <tbody className="text-lg">
                  {applications?.slice(0, 10)?.map((proj, index) => (
                    <tr key={proj.id} className="odd:bg-grey-100 odd:rounded">
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 font-bold text-grey-300">
                        {index + 1}
                      </td>
                      <td className="whitespace-prewrap min-w-[200px] px-3 py-3 font-bold">
                        {proj.project?.metadata?.title.slice(0, 30)}

                        {(proj.project?.metadata?.title.length ?? 0) >= 30
                          ? "..."
                          : ""}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        {formatAmount(proj.uniqueDonorsCount, true)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        $
                        {formatAmount(proj.totalAmountDonatedInUsd?.toFixed(2))}
                      </td>
                      <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right">
                        $
                        {formatAmount(
                          (proj.matchingData?.matchAmountUSD ?? 0).toFixed(2)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TwitterButton = ({ round }: { round: Round }) => {
  const shareText = `Share ${round.roundMetadata?.name}`;

  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;

  return (
    <Button
      type="button"
      onClick={() => window.open(shareUrl, "_blank")}
      className="flex items-center justify-center shadow-sm text-sm rounded border-1 text-black bg-[#C1E4FC] px-4 sm:px-10 border-grey-100 hover:shadow-md"
      data-testid="twitter-button"
    >
      <TwitterBlueIcon />
      <span className="ml-2">Share on Twitter</span>
    </Button>
  );
};

// const ShareStatsButton = ({
//   handleClick,
// }: {
//   handleClick: () => void;
// }): JSX.Element => {
//   return (
//     <button
//       onClick={handleClick}
//       className="rounded-lg px-4 py-2.5 font-mono sm:text-lg bg-green-200 hover:bg-green-300 text-white transition-all flex items-center justify-center gap-2"
//       data-testid="share-results-footer"
//     >
//       <LinkIcon className="w-4 h-4" />
//       Share
//     </button>
//   );
// };

const formatAmount = (amount: string | number, noDigits?: boolean) => {
  return Number(amount).toLocaleString("en-US", {
    maximumFractionDigits: noDigits ? 0 : 2,
    minimumFractionDigits: noDigits ? 0 : 2,
  });
};

/**
 * Fetch finalized matching distribution
 * @param roundId - the ID of a specific round for detail
 * @param signerOrProvider
 */
async function fetchMatchingDistribution(
  roundId: string | undefined,
  signerOrProvider: BaseProvider
): Promise<{
  matchingDistribution: MatchingStatsData[];
}> {
  try {
    if (!roundId) {
      throw new Error("Round ID is required");
    }
    let matchingDistribution: MatchingStatsData[] = [];
    const roundImplementation = new ethers.Contract(
      roundId,
      roundImplementationContract.abi,
      signerOrProvider
    );
    const payoutStrategyAddress = await roundImplementation.payoutStrategy();
    const payoutStrategy = new ethers.Contract(
      payoutStrategyAddress,
      merklePayoutStrategyImplementationContract.abi,
      signerOrProvider
    );
    const distributionMetaPtrRes = await payoutStrategy.distributionMetaPtr();
    const distributionMetaPtr = distributionMetaPtrRes.pointer;
    if (distributionMetaPtr !== "") {
      const matchingDistributionRes =
        await __deprecated_fetchFromIPFS(distributionMetaPtr);
      matchingDistribution = matchingDistributionRes.matchingDistribution;

      matchingDistribution.map((distribution) => {
        distribution.matchAmountInToken = BigNumber.from(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (distribution.matchAmountInToken as any).hex
        );
      });
    }

    return { matchingDistribution };
  } catch (error) {
    console.error("fetchMatchingDistribution", error);
    throw new Error("Unable to fetch matching distribution");
  }
}

const useFetchMatchingDistributionFromContract = (
  roundId: string | undefined,
  chainId: number
): {
  matchingData?: MatchingStatsData[];
  isLoading: boolean;
  isError: boolean;
} => {
  const [matchingData, setMatchingData] = useState<{
    matchingDistribution: MatchingStatsData[];
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!roundId || !chainId) return;
        const chainData = getEnabledChains().find(
          (chain) => chain.id === chainId
        );
        const provider = ethers.getDefaultProvider(
          chainData?.rpcUrls.default.http[0]
        );

        const matchingDataRes = await fetchMatchingDistribution(
          roundId,
          provider
        );
        setMatchingData(matchingDataRes);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        console.error(error);
      }
    }

    fetchData();
  }, [roundId, chainId]);

  return {
    matchingData: matchingData?.matchingDistribution,
    isLoading: isLoading,
    isError: isError,
  };
};
