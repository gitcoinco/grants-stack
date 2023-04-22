/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { renderToPlainText, truncateDescription } from "common";
import { useNetwork } from "wagmi";
import { RoundOverview } from "../api/rounds";
import { getDaysLeft, getPayoutTokenOptions } from "../api/utils";
import {
  BasicCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../common/styles";
import RoundBanner from "./RoundBanner";
import RoundCardStat from "./RoundCardStat";

type RoundCardProps = {
  round: RoundOverview;
};

const RoundCard = (props: RoundCardProps) => {
  const { chain } = useNetwork();

  const daysLeft = getDaysLeft(Number(props.round.roundEndTime));
  const payoutTokens = getPayoutTokenOptions(chain!.id.toString());
  const payoutToken = payoutTokens.find(
    (token) => token.address === props.round.token
  );

  const approvedApplicationsCount = 10;

  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`https://manager.gitcoin.co/#/round/${props.round.id}`}
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
          <p className="mt-4 text-xs" data-testid="days-left">
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left in round
          </p>
        </CardContent>
      </a>

      <div className="bg-white">
        <div className="border-t w-11/12 ml-4" />
        <CardContent className="text-xs mt-3 pb-0">
          <RoundCardStat
            chainId={chain!.id}
            matchAmount={props.round.matchAmount}
            token={payoutToken?.name ?? "ETH"}
            approvedApplicationsCount={approvedApplicationsCount}
          />
        </CardContent>
      </div>
    </BasicCard>
  );
};

export default RoundCard;
