import { FormInputs, ProjectCredentials } from "../types";

export const METADATA_SAVED = "METADATA_SAVED";
export const METADATA_IMAGE_SAVED = "METADATA_IMAGE_SAVED";
export const CREDENTIALS_SAVED = "CREDENTIALS_SAVED";
export const FORM_RESET = "FORM_RESET";

export interface FormReset {
  type: typeof FORM_RESET;
}

export interface MetadataSaved {
  type: typeof METADATA_SAVED;
  metadata: FormInputs;
}

export interface MetadataImageSaved {
  type: typeof METADATA_IMAGE_SAVED;
  image?: Blob;
  fieldName: string;
}

export interface CredentialsSaved {
  type: typeof CREDENTIALS_SAVED;
  credentials?: ProjectCredentials;
}

export type ProjectFormActions =
  | MetadataSaved
  | MetadataImageSaved
  | CredentialsSaved
  | FormReset;

export const formReset = (): ProjectFormActions => ({
  type: FORM_RESET,
});

export const metadataSaved = ({
  title,
  description,
  website,
  projectTwitter,
  userGithub,
  projectGithub,
  logoImg,
  bannerImg,
}: FormInputs): ProjectFormActions => ({
  type: METADATA_SAVED,
  metadata: {
    title,
    description,
    website,
    projectTwitter,
    userGithub,
    projectGithub,
    logoImg,
    bannerImg,
  },
});

export const metadataImageSaved = (
  image: Blob | string | undefined,
  fieldName: string
) => ({
  type: METADATA_IMAGE_SAVED,
  image,
  fieldName,
});

export const credentialsSaved = (
  vc: ProjectCredentials
): ProjectFormActions => ({
  type: CREDENTIALS_SAVED,
  credentials: {
    ...vc,
  },
});
