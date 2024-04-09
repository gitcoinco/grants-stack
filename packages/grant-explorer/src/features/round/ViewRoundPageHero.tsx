import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";
import { getUnixTime } from "date-fns";
import { CalendarIcon } from "common/src/icons";
import { Badge } from "../common/styles";
import {
  CHAINS,
  getDaysLeft,
  isDirectRound,
  isInfiniteDate,
} from "../api/utils";
import { Round } from "../api/types";
import {
  ChainId,
  formatUTCDateAsISOString,
  getRoundStrategyTitle,
  getUTCTime,
} from "common";
import ApplyButton from "./ApplyButton";
import AlloV1 from "common/src/icons/AlloV1";
import AlloV2 from "common/src/icons/AlloV2";
import { useAccount } from "wagmi";
import { PassportWidget } from "../common/PassportWidget";

const builderURL = process.env.REACT_APP_BUILDER_URL;

export default function ViewRoundPageHero({
  round,
  roundId,
  chainId,
  isAfterRoundEndDate,
  tokenSymbol,
}: {
  round: Round;
  chainId: ChainId;
  roundId: string;
  isBeforeRoundEndDate?: boolean;
  isAfterRoundEndDate?: boolean;
  tokenSymbol?: string;
}) {
  const { address: walletAddress } = useAccount();

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: round.roundMetadata?.name,
      path: `/round/${chainId}/${roundId}`,
    },
  ] as BreadcrumbItem[];

  const applicationURL = `${builderURL}/#/chains/${chainId}/rounds/${roundId}`;
  const currentTime = new Date();
  const isBeforeApplicationEndDate =
    round &&
    (isInfiniteDate(round.applicationsEndTime) ||
      round.applicationsEndTime >= currentTime);

  const getRoundEndsText = () => {
    if (!round.roundEndTime) return;

    const roundEndsIn =
      round.roundEndTime === undefined
        ? undefined
        : getDaysLeft(getUnixTime(round.roundEndTime).toString());

    if (roundEndsIn === undefined || roundEndsIn < 0) return;

    if (roundEndsIn === 0) return "Ends today";

    return `${roundEndsIn} ${roundEndsIn === 1 ? "day" : "days"} left`;
  };

  const roundEndsText = getRoundEndsText();
  const isAlloV1 = roundId.startsWith("0x");

  const isSybilDefenseEnabled =
    round.roundMetadata?.quadraticFundingConfig?.sybilDefense === true;
  return (
    <>
      <div className="flex justify-between items-center mb-2 gap-2">
        <div className="py-8 flex flex-col" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        {walletAddress && isSybilDefenseEnabled && (
          <div data-testid="passport-widget">
            <PassportWidget round={round} alignment="right" />
          </div>
        )}
      </div>

      <section>
        <div className="flex flex-col md:items-center md:justify-between md:gap-8 md:flex-row md:mb-0 mb-4">
          <div>
            <div className="pb-4">
              {isAlloV1 && <AlloV1 color="black" />}
              {!isAlloV1 && <AlloV2 color="black" />}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <h1
                data-testid="round-title"
                className="text-2xl sm:text-3xl font-modern-era-medium text-grey-500"
              >
                {round.roundMetadata?.name}
              </h1>
              {!isAfterRoundEndDate ? (
                <Badge
                  color="blue"
                  rounded="full"
                  className="flex-shrink-0 px-2.5 font-modern-era-bold"
                >
                  {roundEndsText}
                </Badge>
              ) : (
                <Badge
                  color="orange"
                  rounded="full"
                  className="flex-shrink-0 px-2.5"
                >
                  Round ended
                </Badge>
              )}
            </div>
            <Badge
              color="grey"
              rounded="full"
              data-testid="round-badge"
              className=" text-gray-900 inline-flex px-2.5 mb-4"
            >
              <span>
                {round.payoutStrategy?.strategyName &&
                  getRoundStrategyTitle(round.payoutStrategy?.strategyName)}
              </span>
            </Badge>

            <div className="text-grey-400 flex gap-2 mb-2">
              <span>on</span>
              <div className="flex items-center">
                <img
                  className="w-4 h-4 mt-0.5 mr-1"
                  src={CHAINS[chainId]?.logo}
                  alt="Round Chain Logo"
                />
                <span>{CHAINS[chainId]?.name}</span>
              </div>
            </div>

            <div className="flex text-grey-500 mb-4">
              <p className="mr-4 flex items-center">
                <span className="mr-2">Donate</span>
                <CalendarIcon className="w-4 h-4 !text-grey-400 inline-block mr-2" />
                <span>
                  <span className="px-2 rounded bg-grey-50">
                    <span className="mr-1">
                      {formatUTCDateAsISOString(round.roundStartTime)}
                    </span>
                    <span>{getUTCTime(round.roundStartTime)}</span>
                  </span>
                  <span className="px-1.5">-</span>
                  <span className="px-2 rounded bg-grey-50">
                    {!isInfiniteDate(round.roundEndTime) ? (
                      <>
                        <span className="mr-1">
                          {formatUTCDateAsISOString(round.roundEndTime)}
                        </span>

                        <span>{getUTCTime(round.roundEndTime)}</span>
                      </>
                    ) : (
                      <span>No End Date</span>
                    )}
                  </span>
                </span>
              </p>
            </div>
          </div>

          {!isDirectRound(round) && (
            <div className="bg-grey-50 p-8 rounded-2xl">
              <p className="text-3xl mb-2 font-mono tracking-tighter">
                {round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toLocaleString()}
                &nbsp;
                {tokenSymbol ?? "..."}
              </p>
              <p>Matching Pool</p>
            </div>
          )}
        </div>

        <p className="mb-4 overflow-x-auto">
          {round.roundMetadata?.eligibility?.description}
        </p>

        {isDirectRound(round) && isBeforeApplicationEndDate && (
          <ApplyButton applicationURL={applicationURL} />
        )}
      </section>
      <hr className="mt-4 mb-8" />
    </>
  );
}
