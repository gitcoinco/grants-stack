import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import DefaultBannerImage from "../../assets/default_banner.jpg";
import { createIpfsImageUrl } from "common/src/ipfs";
import { getConfig } from "common/src/config";

export function ProjectBanner(props: {
  bannerImgCid: string | null;
  classNameOverride?: string;
  resizeHeight?: number;
}) {
  const {
    ipfs: { baseUrl: ipfsBaseUrl },
  } = getConfig();

  const projectBannerImageUrl = props.bannerImgCid
    ? createIpfsImageUrl({
        baseUrl: ipfsBaseUrl,
        cid: props.bannerImgCid,
        height: props.resizeHeight ? props.resizeHeight * 2 : undefined,
      })
    : DefaultBannerImage;

  return (
    <div>
      <img
        className={
          props.classNameOverride ?? "h-[120px] w-full object-cover rounded-t"
        }
        src={projectBannerImageUrl}
        alt="Project Banner"
      />
    </div>
  );
}

export function ProjectLogo(props: {
  className?: string;
  imageCid: string;
  size: number;
}): JSX.Element {
  const {
    ipfs: { baseUrl: ipfsBaseUrl },
  } = getConfig();

  const projectLogoImageUrl = createIpfsImageUrl({
    baseUrl: ipfsBaseUrl,
    cid: props.imageCid,
    height: props.size * 2,
  });

  return (
    <img
      className={`object-cover rounded-full ${props.className ?? ""}`}
      style={{ height: props.size, width: props.size }}
      src={projectLogoImageUrl}
      alt="Project Banner"
    />
  );
}

export function CardSkeleton(): JSX.Element {
  return (
    <div className="bg-white rounded-3xl overflow-hidden p-4 pb-10">
      <Skeleton height="110px" />
      <SkeletonCircle size="48px" mt="-24px" ml="10px" />
      <SkeletonText mt="3" noOfLines={1} spacing="4" skeletonHeight="7" />
      <SkeletonText mt="10" noOfLines={4} spacing="4" skeletonHeight="2" />
    </div>
  );
}
