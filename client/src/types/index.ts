export interface Metadata {
  protocol: number;
  pointer: string;
  id: number;
  title: string;
  description: string;
  roadmap: string;
  challenges: string;
  website: string;
  projectImg?: string | Buffer;
}

// Inputs
export type InputProps = {
  label: string;
  name: string;
  info?: string;
  value?: string | number;
  placeholder?: string;
  changeHandler: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

export type RadioInputProps = {
  name: string;
  value: string;
  currentValue?: string;
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  question: string;
  type: string;
  required: boolean;
  info?: string;
  choices?: string[];
  // temporarily optional unitl passed from RM
  id?: string;
}

export interface RoundApplicationMetadata {
  id: string;
  lastUpdatedOn: number;
  applicationSchema: RoundApplicationQuestion[];
}

export interface Round {
  address: string;
  name: string;
  roundMetaPtr: MetaPtr;
  roundMetadata: RoundMetadata;
  applicationMetaPtr: MetaPtr;
  applicationMetadata: RoundApplicationMetadata;
}
