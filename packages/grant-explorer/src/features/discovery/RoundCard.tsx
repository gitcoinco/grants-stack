import { Card, CardBody, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useNetwork } from "wagmi";
// import { RoundOverview } from "../api/rounds";
import { CHAINS } from "../api/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RoundCard = (props: { round: any }) => {
  // todo: this is just a mock to show an image, remove this when we have the round data
  const { chain } = useNetwork();
  // const roundName = props.round?.roundMetadata?.name;
  const roundEndTime = props.round && Number(props.round.roundEndTime);
  const daysLeftInMs: number = roundEndTime - new Date().getSeconds();
  const daysLeft = Math.ceil(daysLeftInMs / (1000 * 60 * 60 * 24));
  console.log("roundName: ", { daysLeft, props });

  return (
    <div className="mb-6">
      <Link to="/round/id">
        <Card className="border border-grey-100 m-1 rounded shadow-lg">
          <CardBody>
            {/* todo: use random images provided */}
            <Image
              src="https://s3-alpha-sig.figma.com/img/c71c/562a/94d2299f9156d7042db50416393a5b35?Expires=1682899200&Signature=B6jQh~BCXJo5H5Vx6OOP9nrsz9AuuH1y9xwtS36e2iO5j-2MBcSO4o2Ld45Eam1kh4wYxoVqEtDwB9Z0L3z69Xyk79vHw-SxVhTiSJTWM6RHR-ud1MSvZGGz-EiYr05TF7FeCKauQb3hOvtyBLs-w5kUpcThcTPBR8Lgq7nPHCQAPZJUnEnDnu7zwj-5qK64A6bVqHtvl8upKV1aFeDodi5W6dN8T-O~~B1bsRzWsLnsdowQfxgeUZ8ZWkg803YRV8XRMUbAlXN4~GZV2DV3SbJZDkQqB~o~PNPcERinOAz7BGrNK0IEykFTONeqhlrZGkADuVhdW08QQ5dVbyhPYw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"
              alt="Round Header Image"
              borderRadius="sm"
            />
            <div className="m-2">
              <span className="text-[16px] text-grey-500">{"Round Name"}</span>
              <span className="text-sm">
                Round description here lorem ipsum dolor sit amet consectetur.
                Magna pulvinar sit tincidunt viverra lectus malesuada et.
                Elementum eros lacus felis et et nisl eget nisl eu. Fringilla
                lorem libero vel ut orci varius iaculis augue pulvinar.
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs mt-2">
                  {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex flex-row items-center justify-between text-xs">
                <div>
                  <span className="mr-1">123 Projects</span>
                  <span className="mr-1">|</span>
                  <span className="mr-1">$456K funded</span>
                  <span className="mr-1">|</span>
                  <span>$1M match payout</span>
                </div>
                <img src={CHAINS[chain?.id ?? 1].logo} alt="Chain Logo" />
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
};

export default RoundCard;
