import { formatUnits, getAddress } from "viem";
import { Badge } from "../common/styles";
import { useReadContracts } from "wagmi";
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
  // Note: useToken was depreciated for this...
  const result = useReadContracts({
    contracts: [
      {
        address: getAddress(tokenAddress),
        functionName: "getBalance",
        // todo: get the user address from the wallet
        args: ["0x3f15B8c6F9939879Cb030D6dd935348E57109637"],
        abi: ["function getBalance() view returns (uint256)"],
        chainId: Number(chainId),
      },
    ],
    // address: getAddress(tokenAddress),
    // chainId: Number(chainId),
    // enabled: tokenAddress !== zeroAddress,
  });
  // const nativePayoutToken = getPayoutToken(tokenAddress, chainId);

  console.log("The damn result", result);

  const symbol = ""; //result?.data.symbol ?? nativePayoutToken?.name ?? "ETH";
  const decimals = 18; //result?.decimals ?? nativePayoutToken?.decimal ?? 18;

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
