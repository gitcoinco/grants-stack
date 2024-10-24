import { Button } from "common/src/styles";
import { Hex } from "viem";

import shareOnFarcaster from "../../assets/farcaster-logo.svg";
import XTwitter from "../../assets/x-logo.svg";
import Link from "../../assets/link.svg";
import xIcon from "../../assets/x-logo-black.png";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useState } from "react";

export const ShareButtons = ({
  attestationLink,
  isTop,
}: {
  isTop?: boolean;
  attestationLink: string;
}): JSX.Element => {
  const twitterShareUrl = createTwitterAttestationShareUrl(attestationLink);

  const farcasterShareText = getFarcasterAttestationShareText();
  const farcasterShareUrl = createFarcasterShareUrl(farcasterShareText, [
    attestationLink,
  ]);
  const [tooltipVisible, setTooltipVisible] = useState(false); // Add state for tooltip visibility

  const handleCopy = () => {
    navigator.clipboard.writeText(attestationLink);
    setTooltipVisible(true); // Show tooltip
    setTimeout(() => setTooltipVisible(false), 1000); // Hide tooltip after 1 second
  };

  return (
    <div className="flex flex-col items-center z-30">
      <span className="font-modern-era-medium  pb-2 text-[24px]/[28px]">
        Share with your network!
      </span>
      <div className="flex items-center gap-2 pb-1">
        <div className="rainbow-border-icon">
          <div className="icon-button ">
            <img
              className="icon"
              alt="Frame"
              src={shareOnFarcaster}
              onClick={() => window.open(farcasterShareUrl, "_blank")}
            />
          </div>
        </div>
        <div className="rainbow-border-icon">
          <div className="icon-button ">
            <img
              className="icon"
              alt="Frame"
              src={XTwitter}
              onClick={() => window.open(twitterShareUrl, "_blank")}
            />
          </div>
        </div>
        <div className="rainbow-border-icon">
          <div className="icon-button ">
            <img
              className="icon"
              alt="Frame"
              src={Link}
              onClick={handleCopy} // Update onClick to use handleCopy
            />
          </div>
          {tooltipVisible && ( // Render tooltip conditionally
            <span
              className={`${isTop ? "copytooltip-top" : "copytooltip-bottom"}`}
            >
              Copied!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export function createTwitterShareText(props: TwitterButtonParams) {
  return `I just donated to ${props.roundName?.trim() ?? "a round"}${
    props.isMrc && props.roundName ? " and more" : ""
  } on @gitcoin's @grantsstack. Join me in making a difference by donating today, and check out the projects I supported on my Donation History page!\n\nhttps://explorer.gitcoin.co/#/contributors/${
    props.address
  }`;
}

export function createTwitterShareUrl(props: TwitterButtonParams) {
  const shareText = createTwitterShareText(props);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;
}

export function createTwitterAttestationShareText(attestationLink: string) {
  return `Just minted my donation on @gitcoin 🫡\n\nMy impact is now onchain!\n\n${attestationLink}`;
}

export function createTwitterAttestationShareUrl(attestationLink: string) {
  const shareText = createTwitterAttestationShareText(attestationLink);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;
}

export function getFarcasterAttestationShareText() {
  const encodedText1 = encodeURIComponent(`Just minted my donation on  `);
  const encodedText2 = encodeURIComponent(` 🫡\n\nMy impact is now onchain!`);

  // NB: mentions should not be encoded
  return `${encodedText1}@gitcoin${encodedText2}`;
}

export function createFarcasterShareUrl(
  shareText: string,
  embedLinks: string[]
) {
  // NB: embed links should not be encoded
  return `https://warpcast.com/~/compose?text=${shareText}${embedLinks.map((link) => `&embeds[]=${link}`)}`;
}

type TwitterButtonParams = {
  address: Hex;
  roundName?: string;
  isMrc: boolean;
};

export function TwitterButton(props: TwitterButtonParams) {
  const shareUrl = createTwitterShareUrl(props);

  return (
    <Button
      type="button"
      onClick={() => window.open(shareUrl, "_blank")}
      className="flex items-center justify-center shadow-md font-mono text-xs rounded-lg border-1 text-black bg-white px-4 sm:px-10 hover:shadow-lg"
      data-testid="x-button"
    >
      <img src={xIcon} alt="X logo" className="w-4 h-4 font-semibold" />
      <span className="ml-2">Share on X</span>
    </Button>
  );
}

export const ThankYouSectionButtons = ({
  roundName,
  isMrc,
}: {
  roundName: string;
  isMrc: boolean;
}) => {
  const { address } = useAccount();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center xl-mt-[10%] lg-mt-[10%] md-mt-[10%]">
      <p className="text-5xl font-modern-era-medium">Thank you for</p>
      <h1 className="text-5xl font-modern-era-medium mb-8 ">your support!</h1>
      <div className="flex flex-col gap-5 items-center justify-center">
        <div className="flex gap-5 items-center justify-center">
          <TwitterButton
            address={address ?? "0x"}
            roundName={roundName}
            isMrc={isMrc}
          />
          <Button
            type="button"
            onClick={() => navigate(`/contributors/${address}`)}
            className="items-center justify-center text-xs text-black rounded-lg border border-solid bg-grey-100 border-grey-100 px-2 hover:shadow-md sm:px-10 font-mono"
            data-testid="donation-history-button"
          >
            Donation History
          </Button>
        </div>

        <Button
          type="button"
          $variant="outline"
          onClick={() => navigate("/")}
          className="items-center justify-center text-xs rounded-lg w-[193px] border-1 bg-orange-100 hover:shadow-md px-10 font-mono"
          data-testid="home-button"
        >
          Back home
        </Button>
      </div>{" "}
    </div>
  );
};
