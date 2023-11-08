import DefaultBannerImage from "../../assets/default_banner.jpg";
import { createIpfsImageUrl } from "common/src/ipfs";

export function ProjectBanner(props: {
  bannerImgCid: string | null;
  classNameOverride?: string;
  resizeHeight?: number;
}) {
  const projectBannerImageUrl = props.bannerImgCid
    ? createIpfsImageUrl({
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
