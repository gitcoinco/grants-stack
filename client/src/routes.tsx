import { datadogLogs } from "@datadog/browser-logs";

export const slugs = {
  root: `/`,
  grants: `/projects`,
  project: `/chains/:chainId/registry/:registryAddress/projects/:id`,
  edit: `/chains/:chainId/registry/:registryAddress/projects/:id/edit`,
  newGrant: `/projects/new`,
  round: `/chains/:chainId/rounds/:roundId`,
  roundApplication: `/chains/:chainId/rounds/:roundId/apply`,
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
  chainId: string | undefined,
  registryAddress: string | undefined,
  projectId: string | undefined
) => {
  datadogLogs.logger.info(
    `====> Route: /chains/${chainId}/registry/${registryAddress}/projects/${projectId}`
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/registry/${registryAddress}/projects/${projectId}`;
};

export const editPath = (
  chainId: string | undefined,
  registryAddress: string | undefined,
  projectId: string | undefined
) => {
  datadogLogs.logger.info(
    `====> Route: /chains/${chainId}/registry/${registryAddress}/projects/${projectId}/edit`
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/registry/${registryAddress}/projects/${projectId}/edit`;
};

export const roundPath = (
  chainId: string | undefined,
  roundId: string | undefined
) => {
  datadogLogs.logger.info(`====> Route: /chains/${chainId}/rounds/${roundId}`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/rounds/${roundId}`;
};

export const roundApplicationPath = (
  chainId: string | undefined,
  roundId: string | undefined
) => {
  datadogLogs.logger.info(
    `====> Route: /chains/${chainId}/rounds/${roundId}/apply`
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/chains/${chainId}/rounds/${roundId}/apply`;
};
