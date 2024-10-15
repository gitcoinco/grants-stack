import { Button } from "common/src/styles";
import { Hex } from "viem";

import shareOnFarcaster from "../../assets/farcaster-logo.svg";
import XTwitter from "../../assets/x-logo.svg";
import Link from "../../assets/link.svg";
import xIcon from "../../assets/x-logo-black.png";

export const ShareButtons = ({
  attestationLink,
}: {
  attestationLink: string;
}): JSX.Element => {
  const twitterShareUrl = createTwitterAttestationShareUrl(attestationLink);

  const farcasterShareText = getFarcasterAttestationShareText();
  const farcasterShareUrl = createFarcasterShareUrl(farcasterShareText, [
    attestationLink,
  ]);

  return (
    <div className="z-30">
      <div className="flex flex-col items-center justify-center gap-2 relative">
        <span className="font-mona font-semibold py-1">Share Your Impact</span>
        <div className="flex items-center justify-center gap-2 relative">
          <div className="flex w-9 h-9 items-center justify-center gap-2 p-2 relative rounded-3xl border border-solid border-color-primitives-neutral-100 cursor-pointer">
            <img
              className="relative w-9 h-9"
              alt="Frame"
              src={Link}
              onClick={() => {
                navigator.clipboard.writeText(attestationLink);
              }}
            />
          </div>
          <div className="flex w-9 h-9 items-center justify-center gap-2 p-2 relative rounded-3xl border border-solid border-color-primitives-neutral-100 cursor-pointer">
            <img
              className="relative w-9 h-9"
              alt="Frame"
              src={XTwitter}
              onClick={() => window.open(twitterShareUrl, "_blank")}
            />
          </div>
          <div className="flex w-9 h-9 items-center justify-center gap-2 p-2 relative rounded-3xl border border-solid border-color-primitives-neutral-100 cursor-pointer">
            <img
              className="relative w-9 h-9"
              alt="Frame"
              src={shareOnFarcaster}
              onClick={() => window.open(farcasterShareUrl, "_blank")}
            />
          </div>
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
  return `Certified public goods supporter 🫡\n\nMy contribution is now onchain—check out the visual that represents my impact.\n\nHat tip to @gitcoin 💚\n\n${attestationLink}`;
}

export function createTwitterAttestationShareUrl(attestationLink: string) {
  const shareText = createTwitterAttestationShareText(attestationLink);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;
}

export function getFarcasterAttestationShareText() {
  const encodedText1 = encodeURIComponent(
    `Certified public goods supporter 🫡\n\nMy contribution is now onchain—check out the visual that represents my impact.\n\nHat tip to `
  );
  const encodedText2 = encodeURIComponent(` 💚\n`);
  // NB: mentions should not be encoded
  return `${encodedText1}@gitcoin${encodedText2}`;
}

export function createFarcasterShareUrl(
  shareText: string,
  embedLinks: string[]
) {
  // NB: embed links should not be encoded
  return `https://warpcast.com/~/compose?text=${shareText}${embedLinks.forEach((link) => `&embeds[]=${link}`)}`;
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
      className="flex items-center justify-center shadow-sm font-mono text-xs rounded-lg border-1 text-black bg-white px-4 sm:px-10 hover:shadow-md"
      data-testid="x-button"
    >
      <img src={xIcon} alt="X logo" className="w-4 h-4 font-semibold" />
      <span className="ml-2">Share on X</span>
    </Button>
  );
}

import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
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
