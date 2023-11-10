import {
  renderToPlainText,
  ROUND_PAYOUT_DIRECT,
  truncateDescription,
} from "common";
import { RoundOverview, useMetadata } from "../api/rounds";
import { CHAINS, getDaysLeft } from "../api/utils";
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
    applicationsStartTime,
    applicationsEndTime,
    token,
  } = round ?? {};

  const { data: metadata, isLoading } = useMetadata(roundMetaPtr?.pointer);
  const roundEndsIn = getDaysLeft(roundEndTime);
  const roundStartsIn = getDaysLeft(roundStartTime);
  const applicationsStartsIn = getDaysLeft(applicationsStartTime);
  const applicationsEndsIn = getDaysLeft(applicationsEndTime);

  const approvedApplicationsCount = projects?.length ?? 0;
  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`/#/round/${chainId}/${id}`}
        data-testid="round-card"
      >
        <CardHeader className="relative">
          <RoundBanner roundId={id} />
          <RoundTimeBadge
            roundEndsIn={roundEndsIn}
            applicationsEndsIn={applicationsEndsIn}
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
