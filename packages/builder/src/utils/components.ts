import { Metadata, Project } from "../types";
import PinataClient from "../services/pinata";
import { DefaultProjectBanner, DefaultProjectLogo } from "../assets";

export enum ImgTypes {
  bannerImg = "bannerImg",
  logoImg = "logoImg",
}

const defaultImgs = {
  bannerImg: DefaultProjectBanner,
  logoImg: DefaultProjectLogo,
};

export const getProjectImage = (
  loading: boolean,
  imgType: ImgTypes,
  project?: Project | Metadata,
) => {
  const img = project && project[imgType];

  if (loading || !img) {
    return defaultImgs[imgType];
  }

  const pinataClient = new PinataClient();
  return pinataClient.fileURL(img);
};

export const formatDateFromMs = (ts: number) => {
  const date = new Date(ts);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateFromSecs = (ts: number) => {
  const date = new Date(ts * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTimeUTC = (ts: number) => {
  const date = new Date(ts * 1000);
  return date.toUTCString().replace("GMT", "UTC");
};
