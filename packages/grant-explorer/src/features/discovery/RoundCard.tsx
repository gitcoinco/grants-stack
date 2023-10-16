import { ChainId, renderToPlainText, truncateDescription } from "common";
import { RoundOverview } from "../api/rounds";
import {
  getDaysLeft,
  getRoundType,
  isInfiniteDate,
  votingTokens,
} from "../api/utils";
import {
  Badge,
  BasicCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../common/styles";
import RoundBanner from "./RoundBanner";
import RoundCardStat from "./RoundCardStat";
import { useToken } from "wagmi";
import { getAddress } from "viem";

type RoundCardProps = {
  round: RoundOverview;
};

const RoundCard = ({ round }: RoundCardProps) => {
  const {
    id,
    chainId,
    matchAmount,
    projects,
    payoutStrategy,
    roundMetadata,
    roundEndTime,
    applicationsEndTime,
    token,
  } = round;
  const daysLeft = getDaysLeft(Number(roundEndTime));
  const daysLeftToApply = Math.round(getDaysLeft(Number(applicationsEndTime)));

  // Can we simplify this? Would `days < 1000` do the same thing?
  const isValidRoundEndTime = !isInfiniteDate(
    new Date(parseInt(roundEndTime, 10) * 1000)
  );

  const chainIdEnumValue = ChainId[chainId as keyof typeof ChainId];
  const { data } = useToken({
    address: getAddress(token),
    chainId: Number(chainId),
  });

  const nativePayoutToken = votingTokens.find(
    (t) => t.chainId === chainIdEnumValue && t.address === getAddress(token)
  );

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.name ?? "ETH",
  };

  const approvedApplicationsCount = projects?.length ?? 0;
  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`/#/round/${chainIdEnumValue}/${id}`}
        data-testid="round-card"
      >
        <CardHeader className="relative">
          <RoundBanner roundId={id} />
          {daysLeftToApply > 0 ? (
            <Badge
              color="green"
              rounded="full"
              className="absolute top-3 right-3"
            >
              Apply!
            </Badge>
          ) : null}
          <CardTitle
            data-testid="round-name"
            className="absolute bottom-3 left-3"
          >
            {roundMetadata?.name}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">by</span>
            <Badge rounded="full">GITCOIN</Badge>
          </div>
          <CardDescription
            data-testid="round-description"
            className="min-h-[96px]"
          >
            {truncateDescription(
              renderToPlainText(roundMetadata?.eligibility.description ?? ""),
              240
            )}
          </CardDescription>
          <div className="flex gap-2 justfy-between items-center">
            <RoundDaysLeft
              daysLeft={daysLeft}
              daysLeftToApply={daysLeftToApply}
              isValidRoundEndTime={isValidRoundEndTime}
            />

            <Badge color="blue" data-testid="round-badge">
              {getRoundType(payoutStrategy.strategyName)}
            </Badge>
          </div>
          <div className="border-t" />

          <RoundCardStat
            chainId={Number(chainIdEnumValue)}
            matchAmount={matchAmount}
            token={tokenData?.symbol ?? "..."}
            approvedApplicationsCount={approvedApplicationsCount}
          />
        </CardContent>
      </a>
    </BasicCard>
  );
};

const RoundDaysLeft = ({
  daysLeft = 0,
  daysLeftToApply = 0,
  isValidRoundEndTime = true,
}) => {
  const days = pluralize(["day", "days"]);
  return (
    <div className="flex-1">
      {daysLeftToApply > 0 ? (
        <span
          className="text-xs w-full font-mono"
          data-testid="apply-days-left"
        >
          {daysLeftToApply} {days(daysLeftToApply)} left to apply
        </span>
      ) : null}
      <p className="text-xs w-full font-mono" data-testid="days-left">
        {isValidRoundEndTime ? (
          <span>
            {daysLeft} {days(daysLeft)} left in round
          </span>
        ) : (
          <span>No end time</span>
        )}
      </p>
    </div>
  );
};

// If we need something more advanced or to use in another place in codebase, we can pull in a library
const pluralize =
  ([singular = "", plural = ""]) =>
  (num = 0) =>
    num ? (num === 1 ? singular : plural) : "";

export default RoundCard;
