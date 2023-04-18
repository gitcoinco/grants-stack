import { Tab } from "@headlessui/react";
import { Client } from "allo-indexer-client";
import { utils } from "ethers";
import useSWR from "swr";
import { Round } from "../api/types";
import { getUTCDate, getUTCTime } from "../api/utils";
import { useWallet } from "../common/Auth";
import { tabStyles } from "../common/Utils";

const boundFetch = fetch.bind(window);

function useRoundStats(roundId: string) {
  const { chain } = useWallet();
  const client = new Client(
    boundFetch,
    "https://grants-stack-indexer.fly.dev",
    chain.id
  );
  return useSWR([roundId, "/stats"], ([roundId]) => {
    return client.getRoundBy("id", utils.getAddress(roundId.toLowerCase()));
  });
}

export default function ViewRoundSettings(props: { round: Round | undefined }) {
  const { round } = props;

  if (!round) {
    return <></>;
  }
  const roundStartDateTime = round.roundStartTime
    ? `${getUTCDate(round.roundStartTime)} ${getUTCTime(
        round.roundStartTime
      )} UTC`
    : "...";

  return (
    <div className="flex flex-center flex-col mx-auto mt-3 mb-[212px]">
      <p className="text-xl font-semibold leading-6 mb-4 text-base">
        Round Settings
      </p>
      <p className="text-sm text-gray-600 mb-8">
        Changes can be made up until the round starts ({roundStartDateTime})
      </p>

      <Tab.Group>
        <div className="justify-end grow relative">
          <Tab.List className="border-b mb-6 flex items-center justify-between">
            <div className="space-x-8">
              <Tab className={({ selected }) => tabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Round Details
                  </div>
                )}
              </Tab>
              <Tab className={({ selected }) => tabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Round & Application Period
                  </div>
                )}
              </Tab>
              <Tab className={({ selected }) => tabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Funding Settings
                  </div>
                )}
              </Tab>
            </div>
          </Tab.List>
        </div>
        <div className="grid grid-cols-5 grid-rows-2 gap-6">
          <Tab.Panels>
            <Tab.Panel>
              <div>Details</div>
            </Tab.Panel>
            <Tab.Panel>
              <div>Round and App perid</div>
            </Tab.Panel>
            <Tab.Panel>
              <div>Funding Settings</div>
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
}

type StatsCardProps = {
  text: string | number;
  title: string;
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
      </span>
      <div className={"text-2xl leading-8 font-normal text-grey-400"}>
        {props.text}
      </div>
    </div>
  );
}
