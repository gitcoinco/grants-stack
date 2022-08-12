export const slugs = {
  root: `/`,
  grants: `/grants`,
  grant: `/grants/:id`,
  edit: `/grants/:id/edit`,
  newGrant: `/grants/new`,
  round: `/chains/:chainId/rounds/:roundId`,
  roundApplication: `/chains/:chainId/rounds/:roundId/apply`,
};

export const rootPath = () => slugs.root;

export const grantsPath = () => slugs.grants;

export const newGrantPath = () => slugs.newGrant;

export const grantPath = (id: string | number) => `/grants/${id}`;

export const editPath = (id: string | number) => `/grants/${id}/edit`;

export const roundPath = (
  chainId: string | undefined,
  roundId: string | undefined
) => `/chains/${chainId}/rounds/${roundId}`;

export const roundApplicationPath = (
  chainId: string | undefined,
  roundId: string | undefined
) => `/chains/${chainId}/rounds/${roundId}/apply`;
