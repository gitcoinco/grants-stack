import useSWR from "swr";
import { useWallet } from "../common/Auth";
import { Client, Match } from "allo-indexer-client";
import { useParams } from "react-router-dom";
import { utils } from "ethers";
import { useMemo } from "react";

function useAlloIndexerClient(): Client {
  const { chain } = useWallet();

  return useMemo(() => {
    return new Client(
      fetch.bind(window),
      process.env.REACT_APP_ALLO_API_URL ?? "",
      chain.id
    );
  }, [chain.id]);
}

function useRound(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/stats"], ([roundId]) => {
    return client.getRoundBy("id", roundId);
  });
}

function useRoundApplications(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/applications"], ([roundId]) => {
    return client.getRoundApplications(roundId);
  });
}

function useRoundMatchingFunds(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/matches"], ([roundId]) => {
    return client.getRoundMatchingFunds(roundId);
  });
}

export default function ViewRoundStats() {
  const { id } = useParams();

  const roundId = utils.getAddress(id?.toLowerCase() ?? "");

  const { data: round } = useRound(roundId);
  const { data: applications } = useRoundApplications(roundId);

  const approvedApplications = useMemo(() => {
    return applications && applications.filter((a) => a.status === "APPROVED");
  }, [applications]);

  const { data: matches } = useRoundMatchingFunds(roundId);

  const matchAmountUSD = round?.matchAmountUSD;

  return (
    <div className="flex flex-center flex-col mx-auto mt-3 mb-[212px]">
      <p className="text-xl font-semibold leading-6 mb-10 text-base">
        Round Stats
      </p>
      <div className="grid grid-cols-5 grid-rows-2 gap-6">
        <div className={"mr-10 flex items-center "}>Overview</div>
        <StatsCard
          text={
            round &&
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(round.amountUSD)
          }
          title={"Est. Donations Made"}
        />
        <StatsCard
          text={matchAmountUSD && matchAmountUSD.toFixed(2)}
          title={"Matching Funds Available"}
        />
        <StatsCard
          text={round && round.uniqueContributors.toLocaleString("en")}
          title={"Unique Contributors"}
        />
        <StatsCard
          text={round && round.votes.toLocaleString("en")}
          title={"Number of Contributions"}
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
              {matches &&
                matches.map((match: Match) => {
                  return (
                    <tr key={match.applicationId}>
                      <td className="text-sm leading-5 text-gray-400 text-left">
                        {match.projectName}
                      </td>
                      <td className="text-sm leading-5 text-gray-400 text-left">
                        {match.contributionsCount}
                      </td>
                      <td className="text-sm leading-5 text-gray-400 text-left">
                        {matchAmountUSD &&
                          Math.trunc((match.matched / matchAmountUSD) * 100)}
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
            text={
              round &&
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(round.amountUSD / round.uniqueContributors)
            }
          />
          <StatsCard
            grayBorder={true}
            title="Participating projects"
            text={approvedApplications?.length}
          />
        </div>
      </div>
    </div>
  );
}

type StatsCardProps = {
  text?: string | number;
  title: string;
  grayBorder?: boolean;
};

function StatsCard(props: StatsCardProps) {
  return (
    <div
      className={`p-4 border rounded ${
        props.grayBorder ? "border-grey-100" : "border-violet-400"
      } flex flex-col justify-center`}
    >
      <span
        className={
          "text-sm leading-5 font-semibold pb-1 flex items-center gap-1"
        }
      >
        {props.title}
      </span>
      <div className={"text-2xl leading-8 font-normal text-grey-400"}>
        {props.text ?? "-"}
      </div>
    </div>
  );
}
