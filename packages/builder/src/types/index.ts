import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { ChainId } from "common";
import { ProjectApplicationWithRound, RoundCategory } from "data-layer";
import { RoundApplicationMetadata } from "data-layer/dist/roundApplication.types";
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
  chainId: number;
  linkedChains?: number[];
  nonce?: bigint;
  registryAddress: string;
  projectNumber?: number | null;
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
  inputType?: string;
  feedback: {
    type: string;
    message: string;
  };
  prefixBoxText?: string;
};

export type TextAreaProps = InputProps & { rows?: number };

export type AddressInputProps = {
  label: string | ReactNode;
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

export interface JWK {
  alg: string;
  e: string;
  ext: boolean;
  key_ops: string[];
  kty: string;
  n: string;
}

export type Round = {
  id: string;
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
  payoutStrategy: RoundCategory;
  tags: string[];
};

export enum RoundDisplayType {
  Active = "active",
  Current = "current",
  Past = "past",
}

export type ApplicationCardType = {
  application: ProjectApplicationWithRound;
  roundID: string;
  chainId: ChainId;
};

export type ProjectOption = {
  id: string | undefined;
  anchor?: string;
  title?: string;
  chainInfo?: {
    chainId: ChainId;
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
    answer: string | undefined | string[] | number;
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
