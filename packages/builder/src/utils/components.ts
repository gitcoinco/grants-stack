import { getConfig } from "common/src/config";
import PinataClient from "common/src/services/pinata";
import { DefaultProjectBanner, DefaultProjectLogo } from "../assets";
import { Metadata, Project } from "../types";

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
  project?: Project | Metadata
) => {
  const img = project && project[imgType];

  if (loading || !img) {
    return defaultImgs[imgType];
  }

  const pinataClient = new PinataClient(getConfig());

  return pinataClient.fileUrl(img);
};

export const getFileUrl = (cid: string): string => {
  const pinataClient = new PinataClient(getConfig());
  return pinataClient.fileUrl(cid);
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

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatTimeUTC = (ts: number) => {
  const date = new Date(ts * 1000);
  return date.toUTCString().replace("GMT", "UTC");
};

export const formatDateFromString = (ts: string) =>
  new Date(ts).toLocaleDateString();

export const isInfinite = (number: Number) =>
  number === Number.MAX_SAFE_INTEGER || !number;

export const formatDateAsNumber = (ts: string) => Date.parse(ts) / 1000;
