export const slugs = {
  root: `/`,
  grants: `/projects`,
  grant: `/projects/:id`,
  edit: `/projects/:id/edit`,
  newGrant: `/projects/new`,
  round: `/chains/:chainId/rounds/:roundId`,
  roundApplication: `/chains/:chainId/rounds/:roundId/apply`,
};

export const rootPath = () => slugs.root;

export const grantsPath = () => slugs.grants;

export const newGrantPath = () => slugs.newGrant;

export const grantPath = (id: string | number) => `/projects/${id}`;

export const editPath = (id: string | number) => `/projects/${id}/edit`;

export const roundPath = (
  chainId: string | undefined,
  roundId: string | undefined
) => `/chains/${chainId}/rounds/${roundId}`;

export const roundApplicationPath = (
  chainId: string | undefined,
  roundId: string | undefined
) => `/chains/${chainId}/rounds/${roundId}/apply`;
