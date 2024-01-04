import {
  renderToPlainText,
  ROUND_PAYOUT_DIRECT,
  truncateDescription,
} from "common";
import { __deprecated_RoundOverview, useMetadata } from "../api/rounds";
import { CHAINS, getDaysLeft, getRoundStates } from "../api/utils";
import {
  Badge,
  BasicCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../common/styles";
import RoundBanner from "./CardBanner";
import { RoundDaysDetails } from "./RoundDaysDetails";
import { Skeleton, SkeletonText } from "@chakra-ui/react";
import { RoundMatchAmountBadge } from "./RoundMatchAmountBadge";
import { RoundStrategyBadge } from "./RoundStrategyBadge";
import { RoundTimeBadge } from "./RoundTimeBadge";

type RoundType = "all" | "endingSoon" | "active";

type RoundCardProps = {
  round: __deprecated_RoundOverview;
  index: number;
  roundType: RoundType;
};

const RoundCard = ({ round, index, roundType }: RoundCardProps) => {
  const {
    id,
    chainId,
    matchAmount,
    projects,
    payoutStrategy,
    roundStartTime,
    roundEndTime,
    roundMetaPtr,
    applicationsStartTime,
    applicationsEndTime,
    token,
  } = round ?? {};

  const { data: metadata, isLoading } = useMetadata(roundMetaPtr?.pointer);

  const roundEndsIn =
    roundEndTime === undefined ? undefined : getDaysLeft(roundEndTime);
  const roundStartsIn =
    roundStartTime === undefined ? undefined : getDaysLeft(roundStartTime);
  const applicationsStartsIn =
    applicationsStartTime === undefined
      ? undefined
      : getDaysLeft(applicationsStartTime);
  const applicationsEndsIn =
    applicationsEndTime === undefined
      ? undefined
      : getDaysLeft(applicationsEndTime);

  const roundStates = getRoundStates({
    roundStartTimeInSecsStr: roundStartTime,
    roundEndTimeInSecsStr: roundEndTime,
    applicationsEndTimeInSecsStr: applicationsEndTime,
    atTimeMs: Date.now(),
  });

  const approvedApplicationsCount = projects?.length ?? 0;

  const getTrackEventValue = (roundType: RoundType, index: number) => {
    if (roundType === "all") return "round-card";
    if (roundType === "endingSoon") return "home-rounds-ending-card";
    if (roundType === "active") {
      const isDivisibleBy3 = index % 3 === 0;
      const isDivisibleBy4 = index % 4 === 0;

      return isDivisibleBy3 && isDivisibleBy4
        ? "home-donate-now-card-big"
        : "home-donate-now-card-small";
    }

    return "round-card";
  };

  const trackEventValue = getTrackEventValue(roundType, index);

  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`/#/round/${chainId}/${id}`}
        data-testid="round-card"
        data-track-event={trackEventValue}
      >
        <CardHeader className="relative">
          <RoundBanner roundId={id} />
          <RoundTimeBadge roundStates={roundStates} />
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
              applicationsStartsIn={applicationsStartsIn}
              applicationsEndsIn={applicationsEndsIn}
            />

            <RoundStrategyBadge strategyName={payoutStrategy?.strategyName} />
          </div>
          <div className="border-t" />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Badge
                disabled={approvedApplicationsCount === 0}
                data-testid="approved-applications-count"
              >
                {approvedApplicationsCount} projects
              </Badge>
              {payoutStrategy?.strategyName !== ROUND_PAYOUT_DIRECT && (
                <RoundMatchAmountBadge
                  chainId={chainId}
                  tokenAddress={token}
                  matchAmount={matchAmount}
                />
              )}
            </div>
            <div>
              <img className="w-8" src={CHAINS[chainId]?.logo} alt="" />
            </div>
          </div>
        </CardContent>
      </a>
    </BasicCard>
  );
};

export const RoundCardLoading = () => (
  <BasicCard className="w-full h-[378px] animate-pulse"></BasicCard>
);

export default function Round(props: { isLoading?: boolean } & RoundCardProps) {
  return props.isLoading ? <RoundCardLoading /> : <RoundCard {...props} />;
}
