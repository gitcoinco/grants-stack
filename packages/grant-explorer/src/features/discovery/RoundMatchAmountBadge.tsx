import { formatUnits, getAddress, zeroAddress } from "viem";
import { Badge } from "../common/styles";
import { useToken } from "wagmi";
import { getPayoutToken } from "../api/utils";
import { ChainId } from "common";

type RoundCardStatProps = {
  matchAmount: string;
  tokenAddress: string;
  chainId: ChainId;
};

const formatter = new Intl.NumberFormat();

export function RoundMatchAmountBadge({
  chainId,
  matchAmount,
  tokenAddress,
}: RoundCardStatProps) {
  const { data } = useToken({
    address: getAddress(tokenAddress),
    chainId: Number(chainId),
    enabled: tokenAddress !== zeroAddress,
  });
  const nativePayoutToken = getPayoutToken(tokenAddress, chainId);

  const symbol = data?.symbol ?? nativePayoutToken?.name ?? "ETH";
  const decimals = data?.decimals ?? nativePayoutToken?.decimal ?? 18;

  const matchAmountNormalized = formatUnits(BigInt(matchAmount), decimals);

  return (
    <Badge disabled={!matchAmountNormalized}>
      <span className="mr-1" data-testid="match-amount">
        {formatter.format(Number(matchAmountNormalized))}
      </span>
      <span data-testid="match-token">{symbol} match</span>
    </Badge>
  );
}
