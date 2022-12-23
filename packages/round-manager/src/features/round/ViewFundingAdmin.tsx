import { Spinner } from "../common/Spinner";
import { ExclamationCircleIcon as NoInformationIcon } from "@heroicons/react/outline";
import { Round } from "../api/types";

export default function ViewFundingAdmin(props: {
  round: Round | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fundingData: any;
  isFundingDataFetched: boolean;
}) {
  if (props.isFundingDataFetched) {
    <Spinner text="We're fetching your Round." />;
  }

  const currentTime = new Date();
  const isBeforeRoundEndDate =
    props.round && props.round.roundEndTime >= currentTime;
  const isAfterRoundEndDate =
    props.round && props.round.roundEndTime <= currentTime;

  return (
    <div>
      {isBeforeRoundEndDate && <NoInformationContent />}
      {isAfterRoundEndDate && <InformationContent />}
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

function InformationContent() {
  return (
    <div className="mt-8 ml-8">
      <p className="ml-4 font-bold">Finalised Matching Stats</p>
      <div className="flex flex-flow mt-2 overflow-y-auto h-72 border-2 px-4 py-4">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th>Projects</th>
              <th>Project ID</th>
              <th>No of Contributions</th>
              <th>Matching %</th>
            </tr>
          </thead>
          <tbody>
            {sampleFundingData.map((data) => (
              <tr key={data.projectName}>
                <td className="py-2">{data.projectName}</td>
                <td className="py-2">{data.projectId}</td>
                <td className="py-2">{data.contributions}</td>
                <td className="py-2">{data.matchingPercentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const sampleFundingData = [
  {
    projectName: "BETTER",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "Intmax",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
  {
    projectName: "HyperXP",
    projectId: "0xbD1C7e67F42DA834247DA8A35ba21e79fa70b10c",
    contributions: "10",
    matchingPercentage: "0.3",
  },
];
