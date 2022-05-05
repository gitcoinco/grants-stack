const rootSlug = process.env.NODE_ENV === "production" ? "/grants-hub" : "";

export const slugs = {
  root: `${rootSlug}/`,
  grants: `${rootSlug}/grants`,
  grant: `${rootSlug}/grants/:id`,
}

export const rootPath = () => slugs.root;

export const grantsPath = () => slugs.grants;

export const grantPath = (id: string | number) => `${rootSlug}/grants/${id}`;
