import { datadogLogs } from "@datadog/browser-logs";
import { getProjectURIComponents } from "./utils/utils";

export const slugs = {
  root: `/`,
  grants: `/projects`,
  project: `/chains/:chainId/registry/:registryAddress/projects/:id`,
  edit: `/chains/:chainId/registry/:registryAddress/projects/:id/edit`,
  newGrant: `/projects/new`,
  round: `/chains/:chainId/rounds/:roundId`,
  roundApplication: `/chains/:chainId/rounds/:roundId/apply`,
  roundApplicationView: `/chains/:chainId/rounds/:roundId/view/:ipfsHash`,
};

export const rootPath = () => {
  datadogLogs.logger.info(`====> Route: ${slugs.root}`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return slugs.root;
};

export const grantsPath = () => {
  datadogLogs.logger.info(`====> Route: ${slugs.grants}`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return slugs.grants;
};

export const newGrantPath = () => {
  datadogLogs.logger.info(`====> Route: ${slugs.newGrant}`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return slugs.newGrant;
};

export const projectPath = (
  chainId: string,
  registryAddress: string,
  projectId: string
) => {
  datadogLogs.logger.info(
    `====> Route: /chains/${chainId}/registry/${registryAddress}/projects/${projectId}`
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/registry/${registryAddress}/projects/${projectId}`;
};

export const editPath = (
  chainId: string,
  registryAddress: string,
  projectId: string
) => {
  datadogLogs.logger.info(
    `====> Route: /chains/${chainId}/registry/${registryAddress}/projects/${projectId}/edit`
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/registry/${registryAddress}/projects/${projectId}/edit`;
};

export const roundPath = (chainId: string, roundId: string) => {
  datadogLogs.logger.info(`====> Route: /chains/${chainId}/rounds/${roundId}`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/rounds/${roundId}`;
};

export const roundApplicationPath = (chainId: string, roundId: string) => {
  datadogLogs.logger.info(
    `====> Route: /chains/${chainId}/rounds/${roundId}/apply`
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/rounds/${roundId}/apply`;
};

export const roundApplicationViewPath = (
  chainId: string,
  roundId: string,
  ipfsHash: string
) => {
  datadogLogs.logger.info(
    `====> Route: /chains/${chainId}/rounds/${roundId}/view/${ipfsHash}`
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/rounds/${roundId}/view/${ipfsHash}`;
};

export const projectPathByID = (projectID: string) => {
  let path: string | undefined;

  try {
    const { chainId, registryAddress, id } = getProjectURIComponents(projectID);
    path = projectPath(chainId, registryAddress, id);
  } catch (e) {
    // in case projectID has a bad format, getProjectURIComponents
    // will throw an exception and log the errors.
    console.error(e);
  }

  return path;
};
