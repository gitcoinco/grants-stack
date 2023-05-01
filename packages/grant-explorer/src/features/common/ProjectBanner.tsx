import { ProjectMetadata } from "../api/types";
import DefaultBannerImage from "../../assets/default_banner.jpg";

export function ProjectBanner(props: {
  projectMetadata: ProjectMetadata;
  classNameOverride?: string;
  resizeHeight?: number;
}) {
  const projectBannerImage = props.projectMetadata.bannerImg
    ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.projectMetadata.bannerImg}`
    : DefaultBannerImage;

  return (
    <div>
      <img
        className={
          props.classNameOverride ?? "h-[120px] w-full object-cover rounded-t"
        }
        src={`${projectBannerImage}${
          props.resizeHeight ? "?img-height=" + props.resizeHeight : ""
        }`}
        alt="Project Banner"
      />
    </div>
  );
}
