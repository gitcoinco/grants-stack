import { Metadata, Project } from "../types";
import PinataClient from "../services/pinata";

export enum ImgTypes {
  bannerImg = "bannerImg",
  logoImg = "logoImg",
}

const defaultImgs = {
  bannerImg: "./assets/default-project-banner.png",
  logoImg: "./assets/default-project-logo.png",
};

export const getProjectImage = (
  loading: boolean,
  imgType: ImgTypes,
  project?: Project | Metadata
) => {
  const img = project && project[imgType];

  if (loading || !img) {
    return defaultImgs[imgType];
  }

  const pinataClient = new PinataClient();
  return pinataClient.fileURL(img);
};

export const formatDate = (ts: number) => {
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
