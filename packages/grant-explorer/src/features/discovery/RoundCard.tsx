/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { renderToPlainText } from "common";
import { Link } from "react-router-dom";
import { useNetwork } from "wagmi";
import { RoundOverview } from "../api/rounds";
import { CHAINS } from "../api/utils";
import { BasicCard, CardContent, CardDescription, CardHeader, CardTitle } from "../common/styles";

const RoundCard = (props: { round: RoundOverview }) => {

  const { chain } = useNetwork();

  const daysLeft = getDaysLeft(Number(props.round.roundEndTime));
  const token = "ETH"; // TODO: add util function to convert props.round.token
  const approvedApplicationsCount = 10;

  return (
    <BasicCard className="w-full mb-3">
      <Link
        to="/round/${}" // TODO: replace with actual round id
        data-testid="round-card"
      >
        <CardHeader>
          <RoundBanner />
        </CardHeader>

        <CardContent>
          <CardTitle data-testid="round-name">
            {props.round.roundMetadata?.name}
          </CardTitle>
          <CardDescription data-testid="round-description" className="h-[90px]">
            {renderToPlainText(props.round.roundMetadata?.eligibility.description ?? "")}
          </CardDescription>
          <p className="mt-4 text-xs" data-testid="days-left">
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left in round
          </p>
        </CardContent>
      </Link>


      <div className="bg-white border-t">
        <CardContent className="text-xs mt-3 pb-0">
          <RoundCardStat
            chainId={chain!.id}
            matchAmount={props.round.matchAmount}
            token={token}
            approvedApplicationsCount={approvedApplicationsCount}
          />
        </CardContent>
      </div>
    </BasicCard>
  );
};

function RoundBanner() {

  const BANNER_IMAGE = "https://s3-alpha-sig.figma.com/img/c71c/562a/94d2299f9156d7042db50416393a5b35?Expires=1682899200&Signature=B6jQh~BCXJo5H5Vx6OOP9nrsz9AuuH1y9xwtS36e2iO5j-2MBcSO4o2Ld45Eam1kh4wYxoVqEtDwB9Z0L3z69Xyk79vHw-SxVhTiSJTWM6RHR-ud1MSvZGGz-EiYr05TF7FeCKauQb3hOvtyBLs-w5kUpcThcTPBR8Lgq7nPHCQAPZJUnEnDnu7zwj-5qK64A6bVqHtvl8upKV1aFeDodi5W6dN8T-O~~B1bsRzWsLnsdowQfxgeUZ8ZWkg803YRV8XRMUbAlXN4~GZV2DV3SbJZDkQqB~o~PNPcERinOAz7BGrNK0IEykFTONeqhlrZGkADuVhdW08QQ5dVbyhPYw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"

  return (
    <div>
      <img
        className="bg-black h-[140px] w-full object-cover rounded-t"
        src={BANNER_IMAGE}
        alt="Round Banner"
      />
    </div>
  );
}

function RoundCardStat(
  props: {
    chainId: number;
    matchAmount: string;
    token: string;
    approvedApplicationsCount: number;
  }
) {

  return (
    <div className="flex justify-between my-auto">
      <div className="flex text-xs my-auto">
        <span data-testid="approved-applications-count">
          {props.approvedApplicationsCount} projects |
        </span>
        <span className="mx-2" data-testid="match-amount">
          {props.matchAmount}
        </span>
        <span data-testid="match-token">
          {props.token}
        </span>
      </div>

      <div>
        <img className="w-5" src={CHAINS[props.chainId ?? 1].logo} alt="Round Chain Logo" />
      </div>
    </div>
  );
}

const getDaysLeft = (date: number) => {
  const daysLeftInMs = Number(date) - new Date().getSeconds();
  const daysLeft = Math.ceil(daysLeftInMs / (1000 * 60 * 60 * 24));
  return daysLeft;
}

export default RoundCard;
