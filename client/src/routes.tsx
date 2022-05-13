export const slugs = {
  root: `/`,
  grants: `/grants`,
  grant: `/grants/:id`,
  newGrant: `/grants/new`,
};

export const rootPath = () => slugs.root;

export const grantsPath = () => slugs.grants;

export const newGrantPath = () => slugs.newGrant;

export const grantPath = (id: string | number) => `/grants/${id}`;
