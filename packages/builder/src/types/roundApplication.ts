export interface BaseQuestion {
  id: number;
  title: string;
  required: boolean;
  hidden: boolean;
  encrypted: boolean;
}

export type ProjectQuestion = {
  inputType: "project";
};

export type RecipientQuestion = {
  inputType: "recipient";
};

export type EmailQuestion = BaseQuestion & {
  inputType: "email";
};

export type TextQuestion = BaseQuestion & {
  inputType: "text";
};

export type ParagraphQuestion = BaseQuestion & {
  inputType: "paragraph";
};

export type MultipleChoiceQuestion = BaseQuestion & {
  inputType: "multiple-choice";
  options: string[];
};

export type CheckboxQuestion = BaseQuestion & {
  inputType: "checkbox";
  options: string[];
};

export type DropdownQuestion = BaseQuestion & {
  inputType: "checkbox";
  options: string[];
};

export type RoundApplicationQuestion =
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
