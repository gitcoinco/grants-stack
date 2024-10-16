import { Address } from "viem";

export type Round = {
  id: string;
  name: string;
  description: string;
  eligibility: {
    description: string;
    requirements?: { requirement: string }[];
  };
  chainId: number;
  applications?: { id: string }[];
  matching: { amount: bigint; token: Address };
  avatarUrl?: string;
  bannerUrl?: string;
  strategyName?: string;
  phases: {
    applicationsStartTime?: string;
    applicationsEndTime?: string;
    donationsStartTime?: string;
    donationsEndTime?: string;
  };
  roles: { address: Address; role: "ADMIN" | "MANAGER" }[];
  token?: Address;
  strategy: Address;
  managers?: Address[];
  roundMetadata: RoundMetadata;
};

export type RoundMetadata = {
  name: string;
  roundType: string;
  eligibility: RoundEligibility;
};

export type RoundEligibility = {
  description: string;
  requirements: { requirement: string }[];
};

export type ApplicationStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "CANCELLED"
  | "IN_REVIEW";

export type Application = {
  id: string;
  name: string;
  description?: string;
  recipient: Address;
  avatarUrl?: string;
  bannerUrl?: string;
  chainId: number;
  projectId: string;
  contributors?: {
    count?: number;
    amount?: number;
  };
  answers: {
    questionId: number;
    type: string;
    answer: string;
    hidden: boolean;
    question: string;
  }[];
  status: ApplicationStatus;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  anchorAddress: string;
  chainId: number;
};

export type GraphQLResponse<T> = {
  status: string;
  fetchStatus: string;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isInitialLoading: boolean;
  isLoading: boolean;
  error: any;
  data: T;
};
