export interface Metadata {
  uri: string;
  id: number;
  title: string;
  description: string;
  website: string;
  chain: string;
  wallet: string;
  receivedFunding: string;
}

// Inputs
export type InputProps = {
  label: string;
  name: string;
  value?: string;
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
