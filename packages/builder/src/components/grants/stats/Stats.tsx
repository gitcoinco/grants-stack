import { Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../../reducers";
import { ProjectStats } from "../../../reducers/projects";
import RoundDetailsCard from "./RoundDetailsCard";
import StatCard from "./StatCard";

export const slugify = (input: string): string =>
  input
    .trim() // Remove whitespace
    .replace(/\s+/g, "-") // Replace space w/ dash
    .replace(/[^a-zA-Z0-9-]/g, "") // Remove non-alphanumeric chars
    .toLowerCase();

export default function RoundStats() {
  const NA = -1;
  const NAText = "N/A";

  const params = useParams();
  const [details, setDetails] = useState<any>([]);
  const [allTimeStats, setAllTimeStats] = useState<any>({
    allTimeReceived: 0,
    allTimeContributions: 0,
    roundsLength: 0,
  });
  const props = useSelector((state: RootState) => {
    const stats: ProjectStats[] = state.projects?.stats[params.id!];
    const allApplications = state.projects.applications
      ? state.projects.applications[params.id!]
      : [];

    return {
      projectID: params.id!,
      project: state.grantsMetadata[params.id!],
      stats,
      projectApplications: allApplications,
      rounds: state.rounds,
    };
  });

  useEffect(() => {
    const detailsTmp: any[] = [];
    let allTime = {
      allTimeReceived: 0,
      allTimeContributions: 0,
      roundsLength: 0,
    };

    if (props.stats?.length > 0) {
      props.stats.forEach((stat) => {
        allTime = {
          allTimeReceived:
            allTime.allTimeReceived + (stat.success ? stat.fundingReceived : 0),
          allTimeContributions:
            allTime.allTimeContributions +
            (stat.success ? stat.totalContributions : 0),
          roundsLength: props.stats.length,
        };

        const newStat = { ...stat };
        if (newStat.uniqueContributors > 0 || newStat.totalContributions > 0) {
          if (newStat.fundingReceived === 0) newStat.fundingReceived = NA;
          if (newStat.avgContribution === 0) newStat.avgContribution = NA;
        }

        if (props.rounds[stat.roundId]?.round?.programName) {
          detailsTmp.push({
            round: props.rounds[stat.roundId].round,
            stats: { ...newStat },
          });
        }
      });
    }

    setAllTimeStats(allTime);
    setDetails(detailsTmp);
  }, [props.stats, props.rounds]);

  const section = (
    description: any,
    container: any,
    pt: boolean,
    key: string
  ) => (
    <div
      key={key}
      className={`grid md:grid-cols-7 sm:grid-cols-1 border-b border-gitcoin-grey-100 pb-10 ${
        pt && "pt-10"
      }`}
    >
      <div className="md:col-span-2">{description}</div>
      <div className="md:col-span-4 sm:col-span-1 md:flex space-between">
        {container}
      </div>
      <div className="md:col-span-1 sm:col-span-1" />
    </div>
  );

  const renderRoundStats = () => (
    <>
      <div
        className="max-w-[53rem] m-auto w-full bg-green-50
        text-black rounded-2xl py-8 px-2 flex justify-center
        items-center gap-8 flex-wrap mb-16"
      >
        <div className="text-xl sm:text-2xl font-medium">
          Want to check out more stats?
        </div>
        <a
          href={`https://gitcoindonordata.xyz/projects/${slugify(
            props.project.metadata?.title ?? ""
          )}`}
          rel="noreferrer"
          target="_blank"
          className="rounded-lg px-4 py-2.5 font-mono bg-green-200
           hover:bg-green-300 text-white transition-all flex items-center justify-center gap-2"
          data-testid="share-results-footer"
        >
          <span>Project stats dashboard</span>
        </a>
      </div>

      {section(
        <RoundDetailsCard heading="All-Time" />,
        <>
          <StatCard
            heading="Est. Funding Received"
            value={`$${allTimeStats.allTimeReceived.toFixed(2)}`}
            bg="gitcoin-violet-100"
            tooltip="The estimated funding received by this project. This number is not final and may change based on updated data."
          />
          <StatCard
            heading="No. of Contributions"
            value={allTimeStats.allTimeContributions}
            bg="gitcoin-violet-100"
            tooltip="The number of contributions this project has received."
          />
          <StatCard
            heading="Rounds Participated"
            value={allTimeStats.roundsLength}
            bg="gitcoin-violet-100"
            tooltip="The number of rounds this project has participated in."
          />
        </>,
        false,
        "render-round-stats"
      )}

      {details.map((detail: any, index: any) =>
        section(
          <RoundDetailsCard
            heading={detail.round?.programName}
            round={detail.round}
          />,
          <>
            <StatCard
              heading="Est. Funding Received"
              value={
                detail.stats.fundingReceived === NA
                  ? NAText
                  : `$${detail.stats.fundingReceived.toFixed(2)}`
              }
              border
            />
            <StatCard
              heading="Unique Contributors"
              value={
                detail.stats.uniqueContributors === NA
                  ? NAText
                  : detail.stats.uniqueContributors
              }
              border
            />
            <StatCard
              heading="Avg. Contribution"
              value={
                detail.stats.avgContribution === NA
                  ? NAText
                  : `$${detail.stats.avgContribution.toFixed(2)}`
              }
              border
            />
            <StatCard
              heading="No. of Contributions"
              value={
                detail.stats.totalContributions === NA
                  ? NAText
                  : detail.stats.totalContributions
              }
              border
            />
          </>,
          true,
          `details-${index}`
        )
      )}
    </>
  );

  if (!props.projectApplications || props.projectApplications?.length === 0)
    return (
      <div className="text-base text-gitcoin-grey-400 flex items-center justify-center p-10">
        No stats available yet for this project.
      </div>
    );

  if (details?.length === 0 || details?.length !== allTimeStats.roundsLength)
    return (
      <>
        <div className="flex items-center justify-center">
          <Spinner
            label="Loading Project Stats"
            className="flex items-center justify-center"
            thickness="6px"
            boxSize={24}
            speed="0.80s"
            emptyColor="gray.200"
            color="purple.500"
          />
        </div>
        <div className="flex items-center justify-center text-gitcoin-grey-400 text-[18px]">
          Loading...
        </div>
      </>
    );

  return <div>{renderRoundStats()}</div>;
}
