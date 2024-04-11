import { Match } from "allo-indexer-client";
import { getUTCDate } from "common";
import { getConfig } from "common/src/config";
import { utils } from "ethers";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useChainId } from "wagmi";
import {
  useRound,
  useRoundApplications,
  useRoundMatchingFunds,
} from "../../hooks";
import { payoutTokens } from "../api/payoutTokens";

export default function ViewRoundStats() {
  const { id } = useParams();
  const chainId = useChainId();
  const alloVersion = getConfig().allo.version;
  const roundId =
    alloVersion === "allo-v1"
      ? utils.getAddress(id?.toLowerCase() ?? "")
      : (id as string);

  const { data: round } = useRound(roundId);
  const { data: applications } = useRoundApplications(roundId);

  const approvedApplications = useMemo(() => {
    return applications && applications.filter((a) => a.status === "APPROVED");
  }, [applications]);

  const { data: matches } = useRoundMatchingFunds(roundId);
  const matchToken =
    round &&
    payoutTokens.find(
      (t) =>
        t.address.toLowerCase() == round.token.toLowerCase() &&
        t.chainId === chainId
    );

  // check if the round is on Avalanche to prevent matching stats from being displayed
  const isAvaxRound: boolean = chainId === 43114 || chainId === 43113;

  return (
    <div className="flex flex-center flex-col mx-auto mt-3 mb-[212px]">
      <p className="text-xl font-semibold leading-6 mb-10">Round Stats</p>
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
          text={
            round &&
            `${utils.formatUnits(
              round.matchAmount,
              matchToken?.decimal
            )} ${matchToken?.name}`
          }
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
        <div className="col-span-3 border rounded p-4 row-span-2 overflow-y-auto max-h-52">
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
                (as of {getUTCDate(new Date())})
              </span>
            </caption>
            <thead>
              <tr>
                <th className="text-sm leading-5 text-gray-600 text-left">
                  Projects
                </th>
                <th className="text-sm leading-5 text-gray-600 text-left">
                  No. of Contributions
                </th>
                <th className="text-sm leading-5 text-gray-600 text-left">
                  Est. Matching %
                </th>
              </tr>
            </thead>
            {!isAvaxRound && (
              <tbody>
                {round &&
                  matches &&
                  matches.map((match: Match) => {
                    const percentage =
                      Number(
                        (BigInt(1000000) * match.matched) / round.matchAmount
                      ) / 10000;

                    return (
                      <tr key={match.applicationId}>
                        <td className="text-sm leading-5 text-gray-400 text-left">
                          {match.projectName}
                        </td>
                        <td className="text-sm leading-5 text-gray-400 text-left">
                          {match.contributionsCount}
                        </td>
                        <td className="text-sm leading-5 text-gray-400 text-left">
                          {percentage.toString()}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            )}
          </table>
        </div>
        <div className="col-span-1 row-span-2 grid gap-y-6">
          <StatsCard
            grayBorder={true}
            title="Avg. Contribution"
            text={
              round && round.uniqueContributors > 0
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(round.amountUSD / round.uniqueContributors)
                : "N/A"
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
