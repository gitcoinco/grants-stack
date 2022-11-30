import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { Metadata, Project } from "../types";

// Checks if tests are being run jest
export const isJestRunning = () => process.env.JEST_WORKER_ID !== undefined;

export const parseRoundToApply = (
  s?: string
): { chainID?: string; roundAddress?: string } => {
  let chainID;
  let roundAddress;

  if (s !== undefined) {
    [chainID, roundAddress] = s.split(":");
  }

  return { chainID, roundAddress };
};

export const metadataToProject = (
  m: Metadata,
  lastUpdated: number
): Project => {
  const p: Project = {
    lastUpdated,
    createdAt: m.createdAt,
    id: String(m.id),
    title: m.title,
    description: m.description,
    website: m.website,
    bannerImg: m.bannerImg!,
    logoImg: m.logoImg!,
    metaPtr: {
      protocol: String(m.protocol),
      pointer: m.pointer,
    },
    userGithub: m.userGithub,
    projectGithub: m.projectGithub,
    projectTwitter: m.projectTwitter,
    credentials: m.credentials,
  };

  return p;
};

export const getProjectURIComponents = (id: string) => {
  const split = id.split(":");
  if (split.length < 3) {
    datadogRum.addError("Invalid project id", { id });
    datadogLogs.logger.error("Invalid project id", { id });
    throw new Error("Invalid project ID");
  }
  return {
    chainId: split[0],
    registryAddress: split[1],
    id: split[2],
  };
};
