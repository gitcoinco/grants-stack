import { Metadata } from "../types";
import PinataClient from "../services/pinata";

export enum ImgTypes {
  bannerImg = "bannerImg",
  logoImg = "logoImg",
}

const defaultImgs = {
  bannerImg: "./assets/card-img.png",
  logoImg: "./icons/lightning.svg",
};

export const getProjectImage = (
  loading: boolean,
  imgType: ImgTypes,
  project?: Metadata
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
