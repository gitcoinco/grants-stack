import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { ReactNode } from "react";

export type Images = {
  bannerImg?: Blob;
  logoImg?: Blob;
};

export interface Metadata {
  protocol: number;
  pointer: string;
  id: string;
  title: string;
  description: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
  projectTwitter?: string;
  userGithub?: string;
  projectGithub?: string;
  credentials?: ProjectCredentials;
  createdAt?: number;
  updatedAt?: number;
}

export interface Project {
  lastUpdated: Number; // unix timestamp in milliseconds
  id: string;
  title: string;
  description: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
  metaPtr: MetaPtr;
  userGithub?: string;
  projectGithub?: string;
  projectTwitter?: string;
  credentials?: ProjectCredentials;
  createdAt?: number;
}

export type ProjectRegistryMetadata = {
  metadata: {
    protocol: number;
    pointer: string;
  };
};

export type ChangeHandlers =
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>
  | React.ChangeEvent<HTMLSelectElement>;

export type AddressType = {
  resolved: boolean;
  isContract: boolean;
  isSafe: boolean;
};

// Inputs
export type InputProps = {
  label: string | ReactNode;
  name: string;
  info?: string;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  changeHandler: (event: ChangeHandlers) => void;
  required: boolean;
  encrypted?: boolean;
  containerClass?: string;
  tooltip?: ReactNode;
  feedback: {
    type: string;
    message: string;
  };
};

export type TextAreaProps = InputProps & { rows?: number };

export type AddressInputProps = {
  label: string;
  name: string;
  info?: string;
  tooltipValue?: string;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  changeHandler: (event: ChangeHandlers) => void;
  required: boolean;
  encrypted?: boolean;
  onAddressType?: (value?: AddressType) => void;
  warningHighlight?: boolean;
  feedback: {
    type: string;
    message: string;
  };
};

export type ProjectEvents = {
  createdAtBlock: number | undefined;
  updatedAtBlock: number | undefined;
};

export type ProjectEventsMap = {
  [projectID: string]: ProjectEvents;
};

export interface MetaPtr {
  protocol: string;
  pointer: string;
}

export interface RoundSupport {
  type: string;
  info: string;
}

export interface RoundMetadata {
  name: string;
  programContractAddress: string;
  support?: RoundSupport;
}

export interface ProgramMetadata {
  name: string;
}

export interface RoundApplicationQuestion {
  id: number;
  question: string;
  type: string;
  required: boolean;
  info?: string;
  choices?: string[];
  encrypted?: boolean;
}

export interface JWK {
  alg: string;
  e: string;
  ext: boolean;
  key_ops: string[];
  kty: string;
  n: string;
}

export interface RoundApplicationMetadata {
  lastUpdatedOn: number;
  applicationSchema: RoundApplicationQuestion[];
  application_schema: RoundApplicationQuestion[];
  projectQuestionId?: number;
  recipientQuestionId?: number;
}

export type Round = {
  address: string;
  applicationsStartTime: number;
  applicationsEndTime: number;
  roundStartTime: number;
  roundEndTime: number;
  token: string;
  roundMetaPtr: MetaPtr;
  roundMetadata: RoundMetadata;
  applicationMetaPtr: MetaPtr;
  applicationMetadata: RoundApplicationMetadata;
  programName: string;
};

export enum RoundDisplayType {
  Active = "active",
  Current = "current",
  Past = "past",
}

export type ProjectOption = {
  id: string | undefined;
  title?: string;
  chainInfo?: {
    chainId: number;
    chainName: string;
    icon?: any;
  };
};

export interface RoundApplication {
  /**
   * The round contract address applied to
   */
  round: string;
  /**
   * Recipient wallet address of grantee
   */
  recipient: string;
  /**
   * Project information
   */
  project: Project;

  /** List of answers to questions */
  answers: Array<{
    questionId: Number;
    question: string;
    answer: string | undefined;
    encryptedAnswer:
      | {
          ciphertext: string;
          encryptedSymmetricKey: string;
        }
      | undefined;
  }>;
}

export interface SignedRoundApplication {
  signature: string;
  application: RoundApplication;
}

export type ProjectCredentials = {
  github?: VerifiableCredential;
  twitter?: VerifiableCredential;
};

export type FormInputs = {
  title?: string;
  description?: string;
  website?: string;
  bannerImg?: string;
  bannerImgData?: Blob;
  logoImg?: string;
  logoImgData?: Blob;
  projectTwitter?: string;
  userGithub?: string;
  projectGithub?: string;
  credentials?: ProjectCredentials;
};

export enum ProjectFormStatus {
  Network,
  Metadata,
  Verification,
  Preview,
}

export type DynamicFormInputs = {
  [key: string]: string;
};

export enum CredentialProvider {
  Twitter = "ClearTextTwitter",
  Github = "ClearTextGithubOrg",
}
