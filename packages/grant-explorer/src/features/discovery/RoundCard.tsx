import { Card, CardBody, Image, Stack } from "@chakra-ui/react";
import { Round } from "../api/types";

const RoundCard = ({ round }: { round: Round }) => {
  console.log("round", round);

  return (
    <Card className="border border-grey-100 m-1 rounded shadow-lg min-h-[300px]">
      <CardBody>
        <Image
          src="https://s3-alpha-sig.figma.com/img/c71c/562a/94d2299f9156d7042db50416393a5b35?Expires=1682899200&Signature=B6jQh~BCXJo5H5Vx6OOP9nrsz9AuuH1y9xwtS36e2iO5j-2MBcSO4o2Ld45Eam1kh4wYxoVqEtDwB9Z0L3z69Xyk79vHw-SxVhTiSJTWM6RHR-ud1MSvZGGz-EiYr05TF7FeCKauQb3hOvtyBLs-w5kUpcThcTPBR8Lgq7nPHCQAPZJUnEnDnu7zwj-5qK64A6bVqHtvl8upKV1aFeDodi5W6dN8T-O~~B1bsRzWsLnsdowQfxgeUZ8ZWkg803YRV8XRMUbAlXN4~GZV2DV3SbJZDkQqB~o~PNPcERinOAz7BGrNK0IEykFTONeqhlrZGkADuVhdW08QQ5dVbyhPYw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"
          alt="Round Header Image"
          borderRadius="sm"
        />
        <Stack className="m-2">
          <span className="text-[16px] text-grey-500">Round Name</span>
          <p className="text-sm">
            Round description here lorem ipsum dolor sit amet consectetur. Magna
            pulvinar sit tincidunt viverra lectus malesuada et. Elementum eros
            lacus felis et et nisl eget nisl eu. Fringilla lorem libero vel ut
            orci varius iaculis augue pulvinar.
          </p>
          <span className="text-xs mx-1">5 Days left in round</span>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default RoundCard;
