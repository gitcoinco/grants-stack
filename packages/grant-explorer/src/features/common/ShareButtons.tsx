import { Button } from "common/src/styles";
import { Hex } from "viem";

import shareOnFarcaster from "../../assets/farcaster-logo.svg";
import XTwitter from "../../assets/x-logo.svg";
import telegram from "../../assets/telegram-logo.svg";
import Link from "../../assets/link.svg";
import xIcon from "../../assets/x-logo-black.png";

export const ShareButtons = (): JSX.Element => {
  return (
    <div className="pb-8 bg-white z-30">
      <div className="flex flex-col items-center justify-center gap-2 relative">
        <span className="font-mona font-semibold">Share</span>
        <div className="flex items-center justify-center gap-2 relative">
          <div className="flex w-9 h-9 items-center justify-center gap-2 p-2 relative rounded-3xl border border-solid border-color-primitives-neutral-100 cursor-pointer">
            <img className="relative w-9 h-9" alt="Frame" src={Link} />
          </div>
          <div className="flex w-9 h-9 items-center justify-center gap-2 p-2 relative rounded-3xl border border-solid border-color-primitives-neutral-100 cursor-pointer">
            <img className="relative w-9 h-9" alt="Frame" src={XTwitter} />
          </div>
          <div className="flex w-9 h-9 items-center justify-center gap-2 p-2 relative rounded-3xl border border-solid border-color-primitives-neutral-100 cursor-pointer">
            <img
              className="relative w-9 h-9"
              alt="Frame"
              src={shareOnFarcaster}
            />
          </div>
          <div className="flex w-9 h-9 items-center justify-center gap-2 p-2 relative rounded-3xl border border-solid border-color-primitives-neutral-100 cursor-pointer">
            <img className="relative w-9 h-9" alt="Frame" src={telegram} />
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
