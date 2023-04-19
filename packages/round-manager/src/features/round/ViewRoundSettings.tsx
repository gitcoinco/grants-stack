import { Tab } from "@headlessui/react";
import { useNetwork } from "wagmi";
import { Round } from "../api/types";
import { getUTCDate, getUTCTime } from "../api/utils";
import { tabStyles } from "../common/Utils";

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
        <div className="">
          <Tab.Panels>
            <Tab.Panel>
              <DetailsPage round={round} />
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

function DetailsPage(props: { round: Round }) {
  const { round } = props;
  const { chain } = useNetwork();
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            Round Name
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              defaultValue={round.roundMetadata.name}
              disabled
            />
          </div>
        </div>
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            Program Chain
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              defaultValue={chain?.name}
              disabled
            />
          </div>
        </div>
      </div>
      <div
        className={
          "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
        }
      >
        Round Description
      </div>
      <div className={"leading-8 font-normal text-grey-400"}>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          defaultValue={round.roundMetadata.eligibility?.description}
          disabled
        />
      </div>
      <span className="mt-8 inline-flex text-sm text-gray-600 mb-8">
        Where can applicants reach you and/or your team if support is needed?
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            Support Input
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              defaultValue={round.roundMetadata.support?.type}
              disabled
            />
          </div>
        </div>
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            Contact Information
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              defaultValue={round.roundMetadata.support?.info}
              disabled
            />
          </div>
        </div>
      </div>
      <span className="mt-8 inline-flex text-sm text-gray-600 mb-8">
        What requirements do you have for applicants?
      </span>
      {round.roundMetadata.eligibility?.requirements?.map((req, i) => (
        <div key={i} className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Requirement {i + 1}
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                defaultValue={req.requirement}
                disabled
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
