import { ChainId } from "common";
import { formatUnits } from "viem";
import { CHAINS } from "../api/utils";
import { Badge } from "../common/styles";

type RoundCardStatProps = {
  chainId: ChainId;
  matchAmount: string;
  token: string;
  tokenDecimals: number;
  approvedApplicationsCount: number;
};

function RoundCardStat(props: RoundCardStatProps) {
  const {
    approvedApplicationsCount,
    chainId,
    matchAmount,
    token,
    tokenDecimals,
  } = props;
  const matchAmountNormalized = formatUnits(BigInt(matchAmount), tokenDecimals);
  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Badge
          disabled={!approvedApplicationsCount}
          data-testid="approved-applications-count"
        >
          {approvedApplicationsCount} projects
        </Badge>
        <Badge disabled={!matchAmountNormalized}>
          <span className="mr-1" data-testid="match-amount">
            {matchAmountNormalized.toLocaleString()}
          </span>
          <span data-testid="match-token">{token} match</span>
        </Badge>
      </div>
      <div>
        <img
          className="w-8"
          src={CHAINS[chainId]?.logo}
          alt="Round Chain Logo"
        />
      </div>
    </div>
  );
}

export default RoundCardStat;
