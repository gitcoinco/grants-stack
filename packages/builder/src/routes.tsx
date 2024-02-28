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

export const rootPath = () => slugs.root;

export const grantsPath = () => slugs.grants;

export const newGrantPath = () => slugs.newGrant;

export const projectPath = (
  chainId: string,
  registryAddress: string,
  projectId: string
) => `/chains/${chainId}/registry/${registryAddress}/projects/${projectId}`;

export const editPath = (
  chainId: string,
  registryAddress: string,
  projectId: string
) =>
  `/chains/${chainId}/registry/${registryAddress}/projects/${projectId}/edit`;

export const roundPath = (chainId: string, roundId: string) =>
  `/chains/${chainId}/rounds/${roundId}`;

export const roundApplicationPath = (chainId: string, roundId: string) =>
  `/chains/${chainId}/rounds/${roundId}/apply`;

export const roundApplicationPathForProject = (
  chainId: string,
  roundId: string,
  projectId: string
) => `/round/${chainId}/${roundId}/${projectId}`;

export const roundApplicationViewPath = (
  chainId: string,
  roundId: string,
  ipfsHash: string
) => `/chains/${chainId}/rounds/${roundId}/view/${ipfsHash}`;
