import { ReactComponent as WarpcastIcon } from "../../../assets/warpcast-logo.svg";
import { ReactComponent as TwitterBlueIcon } from "../../../assets/x-logo.svg";

import { Round } from "../../api/types";

import { createFarcasterShareUrl } from "../../common/ShareButtons";
import { formatAmount } from "./utils";

export const ShareButton = ({
  round,
  tokenSymbol,
  totalUSDCrowdfunded,
  totalDonations,
  type,
}: {
  round: Round;
  tokenSymbol?: string;
  totalUSDCrowdfunded: number;
  totalDonations: number;

  type: "TWITTER" | "FARCASTER";
}) => {
  const roundName = round.roundMetadata?.name;
  const tokenAmount =
    round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable ?? 0;

  const shareText = `🌐 ${formatAmount(
    tokenAmount,
    true
  )} ${tokenSymbol} matching pool
📈 $${formatAmount(totalUSDCrowdfunded.toFixed(2))} funded so far
🤝 ${formatAmount(totalDonations, true)} donations
👀 Check out ${roundName}’s stats!
`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText + window.location.href
  )}`;

  const farcasterShareUrl = createFarcasterShareUrl(
    encodeURIComponent(shareText),
    [window.location.href]
  );

  return (
    <>
      {type === "TWITTER" ? (
        <button
          type="button"
          onClick={() => window.open(twitterShareUrl, "_blank")}
          className="w-full flex items-center justify-center gap-2 font-mono hover:opacity-70 transition-all shadow-sm border px-4 py-2 rounded-lg border-black hover:shadow-md"
        >
          <TwitterBlueIcon className="h-6" />
          <span className="flex-shrink-0 text-sm">Share on X</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => window.open(farcasterShareUrl, "_blank")}
          className="w-full flex items-center justify-center gap-2 font-mono hover:opacity-70 transition-all shadow-sm border px-4 py-2 rounded-lg border-black hover:shadow-md"
        >
          <span>
            <WarpcastIcon className="h-6" />
          </span>
          <span className="flex-shrink-0 text-sm">Share on Warpcast</span>
        </button>
      )}
    </>
  );
};
