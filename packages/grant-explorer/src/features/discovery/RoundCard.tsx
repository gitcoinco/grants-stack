import { ChainId, renderToPlainText, truncateDescription } from "common";
import { RoundOverview } from "../api/rounds";
import {
  getDaysLeft,
  getRoundType,
  isInfiniteDate,
  votingTokens,
} from "../api/utils";
import {
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

const RoundCard = (props: RoundCardProps) => {
  const daysLeft = getDaysLeft(Number(props.round.roundEndTime));
  const chainIdEnumValue = ChainId[props.round.chainId as keyof typeof ChainId];

  const { data } = useToken({
    address: getAddress(props.round.token),
    chainId: Number(props.round.chainId),
  });

  const nativePayoutToken = votingTokens.find(
    (t) =>
      t.chainId === chainIdEnumValue &&
      t.address === getAddress(props.round.token)
  );

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.name ?? "ETH",
  };

  const approvedApplicationsCount = props.round.projects?.length ?? 0;

  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`/#/round/${chainIdEnumValue}/${props.round.id}`}
        data-testid="round-card"
      >
        <CardHeader>
          <RoundBanner roundId={props.round.id} />
        </CardHeader>

        <CardContent>
          <CardTitle data-testid="round-name">
            {props.round.roundMetadata?.name}
          </CardTitle>
          <CardDescription data-testid="round-description" className="h-[90px]">
            {truncateDescription(
              renderToPlainText(
                props.round.roundMetadata?.eligibility.description ?? ""
              ),
              240
            )}
          </CardDescription>
          <p
            data-testid="round-badge"
            className="text-sm text-gray-900 h-[20px] inline-flex flex-col justify-center bg-grey-100 px-3 mt-4"
            style={{ borderRadius: "20px" }}
          >
            {props.round.payoutStrategy?.strategyName &&
              getRoundType(props.round.payoutStrategy.strategyName)}
          </p>
          <p className="mt-4 text-xs" data-testid="days-left">
            {!isInfiniteDate(
              new Date(parseInt(props.round.roundEndTime, 10) * 1000)
            ) ? (
              <span>
                {daysLeft} {daysLeft === 1 ? "day" : "days"} left in round
              </span>
            ) : (
              <span>No end time</span>
            )}
          </p>
        </CardContent>
      </a>

      <div className="bg-white">
        <div className="border-t w-11/12 ml-4" />
        <CardContent className="text-xs mt-3 pb-0">
          <RoundCardStat
            chainId={Number(chainIdEnumValue)}
            matchAmount={props.round.matchAmount}
            token={tokenData?.symbol ?? "..."}
            approvedApplicationsCount={approvedApplicationsCount}
          />
        </CardContent>
      </div>
    </BasicCard>
  );
};

export default RoundCard;
