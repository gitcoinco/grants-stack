import { datadogLogs } from "@datadog/browser-logs";

export const slugs = {
  root: `/`,
  grants: `/projects`,
  grant: `/projects/:id`,
  edit: `/projects/:id/edit`,
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

export const grantPath = (id: string | number) => {
  datadogLogs.logger.info(`====> Route: /projects/${id}`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/projects/${id}`;
};

export const editPath = (id: string | number) => {
  datadogLogs.logger.info(`====> Route: /projects/${id}/edit`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  return `/projects/${id}/edit`;
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
