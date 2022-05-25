export const slugs = {
  root: `/`,
  grants: `/grants`,
  grant: `/grants/:id`,
  edit: `/edit/:id`,
  newGrant: `/grants/new`,
  components: `/components`,
};

export const rootPath = () => slugs.root;

export const grantsPath = () => slugs.grants;

export const newGrantPath = () => slugs.newGrant;

export const grantPath = (id: string | number) => `/grants/${id}`;

export const editPath = (id: string | number) => `/edit/${id}`;
