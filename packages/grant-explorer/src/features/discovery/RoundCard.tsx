import {
  renderToPlainText,
  RoundPayoutType,
  truncateDescription,
} from "common";
import { RoundOverview, useMetadata } from "../api/rounds";
import { getDaysLeft, getPayoutToken, getRoundType } from "../api/utils";
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
import { RoundDaysDetails } from "./RoundDaysDetails";
import { Skeleton, SkeletonText } from "@chakra-ui/react";

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
    roundStartTime,
    roundEndTime,
    roundMetaPtr,
    applicationsEndTime,
    token,
  } = round ?? {};

  const { data: metadata, isLoading } = useMetadata(roundMetaPtr?.pointer);
  const roundEndsIn = getDaysLeft(Number(roundEndTime));
  const roundStartsIn = getDaysLeft(Number(roundStartTime));
  const applicationsEndIn = getDaysLeft(Number(applicationsEndTime));

  const { data } = useToken({
    address: getAddress(token),
    chainId: Number(chainId),
    enabled: !!token,
  });

  const nativePayoutToken = getPayoutToken(token, chainId);
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
          <RoundTimeBadge
            roundEndsIn={roundEndsIn}
            applicationsEndIn={applicationsEndIn}
          />
          <CardTitle
            data-testid="round-name"
            className="absolute bottom-1 px-2 text-white"
          >
            <Skeleton className="truncate" isLoaded={!isLoading}>
              {metadata?.name}
            </Skeleton>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription
            data-testid="round-description"
            className="min-h-[96px]"
          >
            <SkeletonText isLoaded={!isLoading}>
              {truncateDescription(
                renderToPlainText(metadata?.eligibility?.description ?? ""),
                240
              )}
            </SkeletonText>
          </CardDescription>
          <div className="flex gap-2 justfy-between items-center">
            <RoundDaysDetails
              roundStartsIn={roundStartsIn}
              roundEndsIn={roundEndsIn}
              applicationsEndIn={applicationsEndIn}
            />

            <RoundStrategyBadge strategyName={payoutStrategy?.strategyName} />
          </div>
          <div className="border-t" />
          <RoundCardStat
            chainId={Number(chainId)}
            matchAmount={matchAmount}
            token={tokenData?.symbol ?? "..."}
            tokenDecimals={tokenData?.decimals}
            approvedApplicationsCount={approvedApplicationsCount}
          />
        </CardContent>
      </a>
    </BasicCard>
  );
};
const RoundTimeBadge = ({
  roundEndsIn,
  applicationsEndIn,
}: {
  roundEndsIn?: number;
  applicationsEndIn?: number;
}) => {
  const props = {
    rounded: "full",
    className: "absolute top-3 right-3",
  } as const;

  if (roundEndsIn && roundEndsIn < 0) {
    return (
      <Badge color="orange" {...props}>
        Round ended
      </Badge>
    );
  }
  if (applicationsEndIn && applicationsEndIn > 0) {
    return (
      <Badge color="green" {...props}>
        Apply!
      </Badge>
    );
  }
  return null;
};

const RoundStrategyBadge = ({
  strategyName,
}: {
  strategyName: RoundPayoutType;
}) => {
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
