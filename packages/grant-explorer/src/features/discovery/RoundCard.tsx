import { Link } from "react-router-dom";
import { useNetwork } from "wagmi";
// import { RoundOverview } from "../api/rounds";
import { CHAINS } from "../api/utils";
import { BasicCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../common/styles";

const RoundCard = (props: { round: any }) => {

  const { chain } = useNetwork();
  const roundEndTime = props.round && Number(props.round.roundEndTime);
  const daysLeftInMs = roundEndTime - new Date().getSeconds();
  const daysLeft = Math.ceil(daysLeftInMs / (1000 * 60 * 60 * 24));
  const matchAmount = 100;
  const token = "ETH";
  const approvedApplicationsCount = 10;
  const roundName = "Round Name";

  return (
    <BasicCard className="w-full mb-3">
      <Link
        to="/round/id" // TODO: replace with actual round id
        data-testid="round-card"
      >
        <CardHeader>
          <RoundBanner />
        </CardHeader>

        <CardContent>
          <CardTitle data-testid="round-title">
            {roundName}
          </CardTitle>
          <CardDescription data-testid="round-description" className="h-[90px]">
            {/* {renderToPlainText(project.projectMetadata.description)} */}
            Round description here lorem ipsum dolor sit amet consectetur.
            Magna pulvinar sit tincidunt viverra lectus malesuada et.
            Elementum eros lacus felis et et nisl eget nisl eu. Fringilla
            lorem libero vel ut orci varius iaculis augue pulvinar.
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
            matchAmount={matchAmount}
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
    matchAmount: number;
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

export default RoundCard;
