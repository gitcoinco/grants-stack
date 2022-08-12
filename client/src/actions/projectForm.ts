import { FormInputs, ProjectCredentials } from "../types";

export const METADATA_SAVED = "METADATA_SAVED";
export const CREDENTIALS_SAVED = "CREDENTIALS_SAVED";
export const FORM_RESET = "FORM_RESET";
export interface FormReset {
  type: typeof FORM_RESET;
}
export interface MetadataSaved {
  type: typeof METADATA_SAVED;
  metadata: FormInputs;
}

export interface CredentialsSaved {
  type: typeof CREDENTIALS_SAVED;
  credentials?: ProjectCredentials;
}

export type ProjectFormActions = MetadataSaved | CredentialsSaved | FormReset;

export const formReset = (): ProjectFormActions => ({
  type: FORM_RESET,
});

export const metadataSaved = ({
  title,
  description,
  website,
  bannerImg,
  logoImg,
  projectTwitter,
  userGithub,
  projectGithub,
}: FormInputs): ProjectFormActions => ({
  type: METADATA_SAVED,
  metadata: {
    title,
    description,
    website,
    bannerImg,
    logoImg,
    projectTwitter,
    userGithub,
    projectGithub,
  },
});

export const credentialsSaved = ({
  github,
  twitter,
}: ProjectCredentials): ProjectFormActions => ({
  type: CREDENTIALS_SAVED,
  credentials: {
    github,
    twitter,
  },
});
