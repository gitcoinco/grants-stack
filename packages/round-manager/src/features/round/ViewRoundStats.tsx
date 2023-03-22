import { Spinner } from "../common/Spinner";
import { InformationCircleIcon } from "@heroicons/react/solid";
import useSWR from "swr";
import { useWallet } from "../common/Auth";
import { Client } from "allo-indexer-client";
import { useParams } from "react-router-dom";
import { utils } from "ethers";

function useRoundStats(roundId: string) {
  const { chain } = useWallet();
  const client = new Client(
    fetch,
    "https://grants-stack-indexer.fly.dev",
    chain.id
  );
  return useSWR([roundId, "/stats"], ([roundId]) => {
    return client.getRoundBy("id", utils.getAddress(roundId.toLowerCase()));
  });
}

function useRoundProjects(roundId: string) {
  const { chain } = useWallet();
  const client = new Client(
    fetch,
    "https://grants-stack-indexer.fly.dev",
    chain.id
  );
  return useSWR([roundId, "/projects"], ([roundId]) => {
    return client.getRoundApplications(utils.getAddress(roundId.toLowerCase()));
  });
}

export default function ViewRoundStats() {
  const { id } = useParams();
  const { data, isLoading, error } = useRoundStats(id as string);
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useRoundProjects(id as string);

  const acceptedProjectsCount = projects?.filter(
    (proj) => proj.status === "APPROVED"
  ).length;

  if (isLoading) {
    return <Spinner text="We're fetching your Round." />;
  }

  if (!data) {
    return <div>no data, {JSON.stringify(error)}</div>;
  }

  // TODO: tooltips
  return (
    <div className="flex flex-center flex-col mx-auto mt-3 mb-[212px]">
      <p className="text-xl font-semibold leading-6 mb-10 text-base">
        Round Stats
      </p>
      <div className="grid grid-cols-5 grid-rows-2 gap-6">
        <div className={"mr-10 flex items-center "}>Overview</div>
        <StatsCard
          text={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data.amountUSD)}
          title={"Est. Donations Made"}
          tooltip={"A tooltip // TODO: real tooltip"}
        />
        <StatsCard text={"$10,000"} title={"Matching Funds Available"} />
        <StatsCard
          text={data.uniqueContributors.toLocaleString("en")}
          title={"Unique Contributors"}
          tooltip={"el tooltipo"}
        />
        <StatsCard
          text={data.votes.toLocaleString("en")}
          title={"Number of Contributions"}
          tooltip={"Another tooltip"}
        />
        <hr className={"my-10 col-span-5"} />
        <div className="col-span-1 row-span-2 flex items-center">
          Matching Funds
        </div>
        <div className="col-span-3 row-span-2 overflow-y-auto max-h-52">
          <table
            className={
              "table-auto border-separate border-spacing-y-4 h-full w-full"
            }
          >
            <caption className="text-left">
              <span className={"font-semibold mr-2"}>
                Current Matching Stats
              </span>
              <span className={"text-sm leading-5 text-gray-400"}>
                (as of {})
              </span>
            </caption>
            <thead>
              <tr>
                <th className="text-sm leading-5 text-gray-400 text-left">
                  Projects
                </th>
                <th className="text-sm leading-5 text-gray-400 text-left">
                  No. of Contributions
                </th>
                <th className="text-sm leading-5 text-gray-400 text-left">
                  Est. Matching %
                </th>
              </tr>
            </thead>
            <tbody>
              {Array(10)
                .fill(null)
                .map(() => {
                  return (
                    <tr>
                      <td className="text-sm leading-5 text-gray-400 text-left">
                        Row 1, Cell 1
                      </td>
                      <td className="text-sm leading-5 text-gray-400 text-left">
                        Row 1, Cell 2
                      </td>
                      <td className="text-sm leading-5 text-gray-400 text-left">
                        Row 1, Cell 3
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="col-span-1 row-span-2 grid gap-y-6">
          <StatsCard
            grayBorder={true}
            title="Avg. Contribution"
            text={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(data.amountUSD / data.uniqueContributors)}
          />
          <StatsCard
            grayBorder={true}
            title="Participating projects"
            text={acceptedProjectsCount ?? "Loading..."}
          />
        </div>
      </div>
    </div>
  );
}

type StatsCardProps = {
  text: string | number;
  title: string;
  tooltip?: string;
  grayBorder?: boolean;
};

function StatsCard(props: StatsCardProps) {
  return (
    <div
      className={`p-4 border rounded border ${
        props.grayBorder ? "border-grey-100" : "border-violet-400"
      } flex flex-col justify-center`}
    >
      <span
        className={
          "text-sm leading-5 font-semibold pb-1 flex items-center gap-1"
        }
      >
        {props.title}
        {props.tooltip && (
          <InformationCircleIcon className={"text-gray-500 h-4 w-4"} />
        )}
      </span>
      <div className={"text-2xl leading-8 font-normal text-grey-400"}>
        {props.text}
      </div>
    </div>
  );
}
