export type Images = {
  bannerImg?: Blob;
  logoImg?: Blob;
};

export interface Metadata {
  protocol: number;
  pointer: string;
  id: number;
  title: string;
  description: string;
  roadmap: string;
  challenges: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
}

export type ChangeHandlers =
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>
  | React.ChangeEvent<HTMLSelectElement>;

// Inputs
export type InputProps = {
  label: string;
  name: string;
  info?: string;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  changeHandler: (event: ChangeHandlers) => void;
};

export interface ProjectEvent {
  id: number;
  block: number;
}

export interface MetaPtr {
  protocol: string;
  pointer: string;
}

export interface RoundMetadata {
  name: string;
}

export interface RoundApplicationQuestion {
  id: number;
  question: string;
  type: string;
  required: boolean;
  info?: string;
  choices?: string[];
}

export interface RoundApplicationMetadata {
  id: string;
  lastUpdatedOn: number;
  applicationSchema: RoundApplicationQuestion[];
}

export interface Round {
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
}

export type ProjectOptions = {
  id: number;
  title?: string;
};
