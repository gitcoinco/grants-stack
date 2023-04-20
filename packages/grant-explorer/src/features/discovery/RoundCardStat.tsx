import { CHAINS } from "../api/utils";

function RoundCardStat(props: {
  chainId: number;
  matchAmount: string;
  token: string;
  approvedApplicationsCount: number;
}) {
  return (
    <div className="flex justify-between mb-4">
      <div className="flex text-xs my-auto">
        <span data-testid="approved-applications-count">
          {props.approvedApplicationsCount} projects
        </span>
        <span className="mx-1">|</span>
        <span className="mr-1" data-testid="match-amount">
          {props.matchAmount}
        </span>
        <span data-testid="match-token">{props.token} match amount</span>
      </div>

      <div>
        <img
          className="w-8"
          src={CHAINS[props.chainId ?? 1].logo}
          alt="Round Chain Logo"
        />
      </div>
    </div>
  );
}

export default RoundCardStat;
