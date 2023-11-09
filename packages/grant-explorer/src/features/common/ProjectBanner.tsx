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
