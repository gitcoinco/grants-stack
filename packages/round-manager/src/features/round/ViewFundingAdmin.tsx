import { Spinner } from "../common/Spinner";
import { ExclamationCircleIcon as NoInformationIcon } from "@heroicons/react/outline";
import { MatchingStatsData, Round } from "../api/types";
import { useRoundMatchData } from "../api/api";

export default function ViewFundingAdmin(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  const currentTime = new Date();
  const isBeforeRoundEndDate =
    props.round && props.round.roundEndTime >= currentTime;
  const isAfterRoundEndDate =
    props.round && props.round.roundEndTime <= currentTime;

  return (
    <div>
      {isBeforeRoundEndDate && <NoInformationContent />}
      {isAfterRoundEndDate && (
        <InformationContent
          round={props.round}
          chainId={props.chainId}
          roundId={props.roundId}
        />
      )}
    </div>
  );
}

function NoInformationContent() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <NoInformationIcon className="w-6 h-6" />
      </div>
      <NoInformationMessage />
    </div>
  );
}

function NoInformationMessage() {
  return (
    <>
      <h2 className="mt-8 text-2xl antialiased">No Information Available</h2>
      <div className="mt-2 text-sm">Your round has not ended yet.</div>
      <div className="text-sm">
        Final matching fund percentage will be available once the round has
        finalized.
      </div>
    </>
  );
}

function InformationContent(props: {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
}) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { data, error, loading } = useRoundMatchData(
    props.chainId,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    props.roundId!
  );

  const matchingData: MatchingStatsData[] | undefined = data?.map((data) => {
    const project = props.round?.approvedProjects?.filter(
      (project) =>
        project.projectRegistryId.toLowerCase() === data.projectId.toLowerCase()
    )[0];
    return {
      projectName: project?.projectMetadata?.title,
      projectId: data.projectId,
      uniqueContributorsCount: data.uniqueContributorsCount,
      matchPoolPercentage: data.matchPoolPercentage,
    };
  });
  return (
    <div>
      {loading && <Spinner text="We're fetching the matching data." />}
      {!error ? (
        <InformationTable matchingData={matchingData} />
      ) : (
        <ErrorMessage />
      )}
    </div>
  );
}

function ErrorMessage() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <NoInformationIcon className="w-6 h-6" />
      </div>
      <h2 className="mt-8 text-2xl antialiased" data-testid="error-info">
        Error
      </h2>
      <div className="mt-2 text-sm">There was an error fetching the data.</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InformationTable(props: {
  matchingData: MatchingStatsData[] | undefined;
}) {
  return (
    <div className="mt-8 ml-8">
      <div className="flex flex-row relative">
        <p className="ml-4 font-bold" data-testid="final-match-stats-title">
          Finalized Matching Stats
        </p>
        <p className="ml-4 font-bold text-violet-400 absolute left-3/4 ml-32">
          ({props.matchingData?.length}) Projects
        </p>
      </div>
      <div className="flex flex-flow mt-2 overflow-y-auto h-72 border-2 px-4 py-4">
        <table className="w-full" data-testid="matching-stats-table">
          <thead>
            <tr className="text-left">
              <th>Project Name</th>
              <th>Project ID</th>
              <th>No of Contributors</th>
              <th>Matching %</th>
            </tr>
          </thead>
          <tbody>
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              props.matchingData?.map((data: any) => (
                <tr key={data.projectId}>
                  <td className="py-2">
                    {data.projectName.slice(0, 16) + "..."}
                  </td>
                  <td className="py-2">
                    {data.projectId.slice(0, 32) + "..."}
                  </td>
                  <td className="py-2">{data.uniqueContributorsCount}</td>
                  <td className="py-2">
                    {data.matchPoolPercentage.toFixed(4) * 100 + "%"}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
