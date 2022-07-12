export const slugs = {
  root: `/`,
  grants: `/grants`,
  grant: `/grants/:id`,
  edit: `/grants/:id/edit`,
  newGrant: `/grants/new`,
  round: `/rounds/:id`,
  roundApplication: `/rounds/:id/apply`,
};

export const rootPath = () => slugs.root;

export const grantsPath = () => slugs.grants;

export const newGrantPath = () => slugs.newGrant;

export const grantPath = (id: string | number) => `/grants/${id}`;

export const editPath = (id: string | number) => `/grants/${id}/edit`;

export const roundPath = (id: string | number) => `/rounds/${id}`;

export const roundApplicationPath = (id: string | number) =>
  `/rounds/${id}/apply`;
