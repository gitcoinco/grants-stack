import { BigNumber } from "ethers";
import { CHAINS } from "../api/utils";

type RoundCardStatProps = {
  chainId: number;
  matchAmount: string;
  token: string;
  approvedApplicationsCount: number;
};

function RoundCardStat(props: RoundCardStatProps) {
  const matchAmount = BigNumber.from(props.matchAmount);
  const matchAmountNormalized = matchAmount.div("1000000000000000000");

  return (
    <div className="flex justify-between mb-4">
      <div className="flex text-xs my-auto">
        <span data-testid="approved-applications-count">
          {props.approvedApplicationsCount} projects
        </span>
        <span className="mx-1">|</span>
        <span className="mr-1" data-testid="match-amount">
          {matchAmountNormalized.toString()}
        </span>
        <span data-testid="match-token">{props.token} match amount</span>
      </div>

      <div>
        {CHAINS[props.chainId ?? 1] ? (
          <img
            className="w-8"
            src={CHAINS[props.chainId ?? 1].logo}
            alt="Round Chain Logo"
          />
        ) : (
          <img className="w-8" src={CHAINS[1].logo} alt="Round Chain Logo" />
        )}
      </div>
    </div>
  );
}

export default RoundCardStat;
