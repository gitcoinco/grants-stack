import { ReactNode } from "react";
import { GrantApplication, ProgressStatus } from "../api/types";

export type CardProps = {
  title: string;
  description: string;
  footerContent: React.ReactNode;
  displayBar?: {
    applicationDate: string;
    roundDate: string;
    matchingFunds: string;
  };
  status?: {
    status: string;
    style: string;
  }; // todo: update to Status type
  strategyType?: string;
  color?: string;
  qfRoundsCount?: number;
  dgRoundsCount?: number;
};

export type SpinnerProps = {
  text: string;
};

export type Step = {
  name: string;
  description: string;
  status: ProgressStatus;
};

export interface NavbarProps {
  programCta?: boolean;
}

export interface ProgressModalProps {
  isOpen: boolean;
  steps: Step[];
  heading?: string;
  subheading?: string;
  redirectUrl?: string;
  children?: ReactNode;
}

export type ViewGrantsExplorerButtonType = {
  styles?: string;
  iconStyle?: string;
  chainId: string;
  roundId: string | undefined;
};

export type CopyToClipboardType = {
  textToCopy: string;
  styles?: string;
  iconStyle?: string;
};

export type ApplicationStatusViewProps = {
  allApplications: {
    pendingApplications: GrantApplication[];
    approvedApplications: GrantApplication[];
    rejectedApplications: GrantApplication[];
    inReviewApplications: GrantApplication[];
  };
  isDirectRound: boolean;
};

export type PrettyDate = {
  date: string;
  time: string;
  timezone: string;
};

export type PrettyDatesResult = {
  start: PrettyDate;
  end: PrettyDate | null;
};
