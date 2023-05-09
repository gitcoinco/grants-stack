import { Tab } from "@headlessui/react";
import { getUTCDate, getUTCTime } from "common";
import { useNetwork } from "wagmi";
import { Round } from "../api/types";
import { payoutTokens } from "../api/utils";
import { horizontalTabStyles } from "../common/Utils";

export default function ViewRoundSettings(props: { round: Round | undefined }) {
  const { round } = props;

  if (!round) {
    return <></>;
  }
  const roundStartDateTime = round.roundStartTime
    ? `${getUTCDate(round.roundStartTime)} ${getUTCTime(round.roundStartTime)}`
    : "...";

  return (
    <div className="flex flex-center flex-col mx-auto mt-3 mb-[212px]">
      <p className="text-xl font-semibold leading-6 mb-4 text-base">
        Round Settings
      </p>
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          Changes can be made up until the round starts ({roundStartDateTime}).
        </p>
        <p className="text-sm text-gray-600">
          Once the round starts, you’ll only be able to change the Round End
          Date.
        </p>
      </div>

      <Tab.Group>
        <div className="justify-end grow relative">
          <Tab.List className="border-b mb-6 flex items-center justify-between">
            <div className="space-x-8">
              <Tab className={({ selected }) => horizontalTabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Round Details
                  </div>
                )}
              </Tab>
              <Tab className={({ selected }) => horizontalTabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Round & Application Period
                  </div>
                )}
              </Tab>
              <Tab className={({ selected }) => horizontalTabStyles(selected)}>
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
              <RoundApplicationPeriod round={round} />
            </Tab.Panel>
            <Tab.Panel>
              <Funding round={round} />
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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
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
          className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
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
        <div key={i} className="grid grid-cols-1 grid-rows-1 gap-4 mb-4">
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
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
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

function RoundApplicationPeriod(props: { round: Round }) {
  const { round } = props;
  return (
    <div className="w-full">
      <span className="mt-4 inline-flex text-sm text-gray-600 mb-8">
        What are the dates for the Applications and Round voting period(s)?
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            Applications
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              defaultValue={`${getUTCDate(
                round.applicationsStartTime
              )} ${getUTCTime(round.applicationsStartTime)}`}
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
            &nbsp;
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              defaultValue={`${getUTCDate(
                round.applicationsEndTime
              )} ${getUTCTime(round.applicationsEndTime)}`}
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
            Round
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              defaultValue={`${getUTCDate(round.roundStartTime)} ${getUTCTime(
                round.roundStartTime
              )}`}
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
            &nbsp;
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              defaultValue={`${getUTCDate(round.roundEndTime)} ${getUTCTime(
                round.roundEndTime
              )}`}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Funding(props: { round: Round }) {
  const { round } = props;

  const matchingFundPayoutToken =
    props.round &&
    payoutTokens.filter(
      (t) => t.address.toLocaleLowerCase() == round.token.toLocaleLowerCase()
    )[0];

  const matchingFunds =
    (props.round &&
      props.round.roundMetadata.quadraticFundingConfig
        ?.matchingFundsAvailable) ??
    0;

  return (
    <div className="w-full">
      <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-4">
        Funding Amount
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            Payout Token
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              defaultValue={matchingFundPayoutToken.name}
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
            Matching Funds Available
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-2/12 rounded-l-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              defaultValue={matchingFundPayoutToken.name}
              disabled
            />
            <input
              type="text"
              className="w-10/12 rounded-r-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              defaultValue={matchingFunds}
              disabled
            />
          </div>
        </div>
      </div>

      <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-4">
        Matching Cap
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            Do you want a matching cap for projects?
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="radio"
              className="mr-2"
              checked={round.roundMetadata.quadraticFundingConfig.matchingCap}
              disabled
            />{" "}
            Yes
            <input
              type="radio"
              className="ml-4 mr-2"
              checked={!round.roundMetadata.quadraticFundingConfig.matchingCap}
              disabled
            />{" "}
            No
          </div>
        </div>
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            If so, how much?
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              defaultValue={
                round.roundMetadata.quadraticFundingConfig.matchingCapAmount ??
                0
              }
              disabled
            />
          </div>
        </div>
      </div>
      <div>
        <span className="mt-4 inline-flex text-sm text-gray-600 mb-8">
          A single project can only receive a maximum of{" "}
          {round.roundMetadata.quadraticFundingConfig.matchingCapAmount ?? 0}%
          of the matching fund (
          {matchingFunds *
            (round.roundMetadata.quadraticFundingConfig.matchingCapAmount ??
              0)}{" "}
          {matchingFundPayoutToken.name}).
        </span>
      </div>

      <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-4">
        Minimum Donation Threshold
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            Do you want a minimum donation threshold for projects?
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="radio"
              className="mr-2"
              checked={
                round.roundMetadata.quadraticFundingConfig.minDonationThreshold
              }
              disabled
            />{" "}
            Yes
            <input
              type="radio"
              className="ml-4 mr-2"
              checked={
                !round.roundMetadata.quadraticFundingConfig.minDonationThreshold
              }
              disabled
            />{" "}
            No
          </div>
        </div>
        <div>
          <div
            className={
              "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
            }
          >
            If so, how much?
          </div>
          <div className={"leading-8 font-normal text-grey-400"}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              defaultValue={
                round.roundMetadata.quadraticFundingConfig
                  .minDonationThresholdAmount ?? 0
              }
              disabled
            />
          </div>
        </div>
      </div>
      <div>
        <span className="mt-4 inline-flex text-sm text-gray-600 mb-8">
          Each donation has to be a minimum of{" "}
          {round.roundMetadata.quadraticFundingConfig
            .minDonationThresholdAmount ?? 0}{" "}
          USD equivalent for it to be eligible for matching.
        </span>
      </div>

      <div>
        <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-2">
          Sybil Defense
        </span>
      </div>
      <div>
        <span className="inline-flex text-sm font-light text-gray-600 mb-4">
          Ensure that project supporters are not bots or sybil with Gitcoin
          Passport. Learn more about Gitcoin Passport here.
        </span>
      </div>
      <div className="grid grid-cols-1 grid-rows-2 gap-4 mb-4">
        <div>
          <div
            className={"text-sm leading-5 pb-1 flex items-center gap-1 mb-2"}
          >
            <input
              type="radio"
              name="sybil"
              value="yes"
              checked={round.roundMetadata.quadraticFundingConfig.sybilDefense}
            />
            Yes, enable Gitcoin Passport (Recommended)
            <br />
            Allow matching only for donation from project supporters that have
            verified their identity on Gitcoin Passport.
          </div>
          <div
            className={"text-sm leading-5 pb-1 flex items-center gap-1 mb-2"}
          >
            <input
              type="radio"
              name="sybil"
              value="no"
              checked={!round.roundMetadata.quadraticFundingConfig.sybilDefense}
            />
            No, disable Gitcoin Passport
            <br />
            Allow matching for all donation, including potentially sybil ones.
          </div>
        </div>
      </div>
    </div>
  );
}
