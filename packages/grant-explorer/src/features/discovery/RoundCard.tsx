import {
  renderToPlainText,
  RoundPayoutType,
  truncateDescription,
} from "common";
import { RoundOverview, useMetadata } from "../api/rounds";
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
import RoundBanner from "./CardBanner";
import RoundCardStat from "./RoundCardStat";
import { useToken } from "wagmi";
import { getAddress } from "viem";
import { RoundDaysLeft } from "./RoundDaysLeft";

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
    roundEndTime,
    roundMetaPtr,
    applicationsEndTime,
    token,
  } = round ?? {};

  const { data: metadata } = useMetadata(roundMetaPtr?.pointer);

  const daysLeft = getDaysLeft(Number(roundEndTime));
  const daysLeftToApply = getDaysLeft(Number(applicationsEndTime));

  // Can we simplify this? Would `days < 1000` do the same thing?
  const isValidRoundEndTime = !isInfiniteDate(
    new Date(parseInt(roundEndTime, 10) * 1000)
  );

  const { data } = useToken({
    address: getAddress(token),
    chainId: Number(chainId),
    enabled: !!token,
  });

  const nativePayoutToken = votingTokens.find(
    (t) => t.chainId === Number(chainId) && t.address === getAddress(token)
  );
  const { decimals = 18 } = data ?? {};

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.name ?? "ETH",
    decimals,
  };

  const approvedApplicationsCount = projects?.length ?? 0;
  return (
    <BasicCard className="w-full hover:opacity-90 transition hover:shadow-none">
      <a
        target="_blank"
        href={`/#/round/${chainId}/${id}`}
        data-testid="round-card"
      >
        <CardHeader className="relative">
          <RoundBanner roundId={id} />
          {daysLeftToApply > 0 && (
            <Badge
              color="green"
              rounded="full"
              className="absolute top-3 right-3"
            >
              Apply!
            </Badge>
          )}
          <CardTitle
            data-testid="round-name"
            className="absolute bottom-3 px-2 text-white"
          >
            {metadata?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription
            data-testid="round-description"
            className="min-h-[96px]"
          >
            {truncateDescription(
              renderToPlainText(metadata?.eligibility?.description ?? ""),
              240
            )}
          </CardDescription>
          <div className="flex gap-2 justfy-between items-center">
            <RoundDaysLeft
              daysLeft={daysLeft}
              daysLeftToApply={daysLeftToApply}
              isValidRoundEndTime={isValidRoundEndTime}
            />

            <RoundBadge strategyName={payoutStrategy?.strategyName} />
          </div>
          <div className="border-t" />

          <RoundCardStat
            chainId={Number(chainId)}
            matchAmount={matchAmount}
            token={tokenData?.symbol ?? "..."}
            decimals={tokenData?.decimals}
            approvedApplicationsCount={approvedApplicationsCount}
          />
        </CardContent>
      </a>
    </BasicCard>
  );
};

const RoundBadge = ({ strategyName }: { strategyName: RoundPayoutType }) => {
  const color = ({ MERKLE: "blue", DIRECT: "yellow" } as const)[strategyName];
  return (
    <Badge color={color} data-testid="round-badge">
      {getRoundType(strategyName) ?? "Unknown"}
    </Badge>
  );
};

export const RoundCardLoading = () => (
  <BasicCard className="w-full h-[378px] animate-pulse"></BasicCard>
);

export default function Round(props: { isLoading?: boolean } & RoundCardProps) {
  return props.isLoading ? <RoundCardLoading /> : <RoundCard {...props} />;
}
