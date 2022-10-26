import { Status as RoundApplicationStatus } from "../reducers/roundApplication";
import { Status as GrantStatus } from "../reducers/newGrant";

export type Status = RoundApplicationStatus | GrantStatus;

export type Step = {
  name: string;
  description: string;
  status: Status;
};

export const applicationSteps: Step[] = [
  {
    name: "Gathering Data",
    description: "Preparing your application.",
    status: RoundApplicationStatus.BuildingApplication,
  },
  {
    name: "Authenticating",
    description: "Sign in to Lit Protocol.",
    status: RoundApplicationStatus.LitAuthentication,
  },
  {
    name: "Encrypting",
    description: "Signing the application metadata with your wallet.",
    status: RoundApplicationStatus.SigningApplication,
  },
  {
    name: "Storing",
    description: "The metadata is being saved in a safe place.",
    status: RoundApplicationStatus.UploadingMetadata,
  },
  {
    name: "Applying",
    description: "Sending your application.",
    status: RoundApplicationStatus.SendingTx,
  },
  {
    name: "Redirecting",
    description: "Just another moment while we finish things up.",
    status: RoundApplicationStatus.Sent,
  },
];

export const grantSteps: Step[] = [
  {
    name: "Storing",
    description: "The metadata is being saved in a safe place.",
    status: GrantStatus.UploadingImages,
  },
  {
    name: "Deploying",
    description: "Connecting to the Mainnet blockchain.",
    status: GrantStatus.TransactionInitiated,
  },
  {
    name: "Redirecting",
    description: "Just another moment while we finish things up.",
    status: GrantStatus.Completed,
  },
];
