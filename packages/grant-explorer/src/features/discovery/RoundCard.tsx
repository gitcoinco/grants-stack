/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { renderToPlainText } from "common";
import { Link } from "react-router-dom";
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
}

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
      <Link to={`/round/${props.round.id}`} data-testid="round-card">
        <CardHeader>
          <RoundBanner />
        </CardHeader>

        <CardContent>
          <CardTitle data-testid="round-name">
            {props.round.roundMetadata?.name}
          </CardTitle>
          <CardDescription data-testid="round-description" className="h-[90px]">
            {renderToPlainText(
              props.round.roundMetadata?.eligibility.description ?? ""
            )}
          </CardDescription>
          <p className="mt-4 text-xs" data-testid="days-left">
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left in round
          </p>
        </CardContent>
      </Link>

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
