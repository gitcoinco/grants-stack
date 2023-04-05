export interface BaseQuestion {
  id: number;
  title: string;
  required: boolean;
  hidden: boolean;
  encrypted: boolean;
}

export type ProjectQuestion = {
  id: number;
  type: "project";
};

export type RecipientQuestion = {
  id: number;
  type: "recipient";
};

export type EmailQuestion = BaseQuestion & {
  type: "email";
};

export type AddressQuestion = BaseQuestion & {
  type: "address";
};

export type TextQuestion = BaseQuestion & {
  type: "text" | "short-answer" | "link";
};

export type ParagraphQuestion = BaseQuestion & {
  type: "paragraph";
};

export type MultipleChoiceQuestion = BaseQuestion & {
  type: "multiple-choice";
  options: string[];
};

export type CheckboxQuestion = BaseQuestion & {
  type: "checkbox";
  options: string[];
};

export type DropdownQuestion = BaseQuestion & {
  type: "dropdown";
  options: string[];
};

export type RoundApplicationQuestion =
  | AddressQuestion
  | ProjectQuestion
  | RecipientQuestion
  | EmailQuestion
  | TextQuestion
  | ParagraphQuestion
  | MultipleChoiceQuestion
  | CheckboxQuestion
  | DropdownQuestion;

export interface ProjectRequirements {
  twitter: {
    required: boolean;
    verification: boolean;
  };
  github: {
    required: boolean;
    verification: boolean;
  };
}

export interface RoundApplicationMetadata {
  version: string;
  lastUpdatedOn: number;
  applicationSchema: {
    questions: RoundApplicationQuestion[];
    requirements: ProjectRequirements;
  };
}

export type RoundApplicationAnswers = {
  [key: string | number]: string | string[];
};
