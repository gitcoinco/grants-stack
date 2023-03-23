import { Spinner } from "../common/Spinner";
import { InformationCircleIcon } from "@heroicons/react/solid";

export default function ViewRoundStats(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roundStats: any;
  isRoundStatsFetched: boolean;
}) {
  if (props.isRoundStatsFetched) {
    <Spinner text="We're fetching your Round." />;
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
          text={"$180,000"}
          title={"Est. Donations Made"}
          tooltip={"A tooltip // TODO: real tooltip"}
        />
        <StatsCard text={"$10,000"} title={"Matching Funds Available"} />
        <StatsCard
          text={"321"}
          title={"Unique Contributors"}
          tooltip={"el tooltipo"}
        />
        <StatsCard
          text={"437"}
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
                (as of 10/22/2022)
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
          <StatsCard grayBorder={true} title="Avg. Contribution" text="$5.93" />
          <StatsCard
            grayBorder={true}
            title="Participating projects"
            text="67"
          />
        </div>
      </div>
    </div>
  );
}

type StatsCardProps = {
  text: string;
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
