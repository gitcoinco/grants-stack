import { Status as RoundApplicationStatus } from "../reducers/roundApplication";
import { Status as GrantStatus } from "../reducers/newGrant";

export type Status = RoundApplicationStatus | GrantStatus;

export type Step = {
  name: string;
  description: string;
  status: Status;
};

export const getApplicationSteps = (newProject?: boolean): Step[] => {
  const preSteps = [
    {
      name: "Gathering Data",
      description: "Preparing your application.",
      status: RoundApplicationStatus.BuildingApplication,
    },
    {
      name: "Encrypting",
      description: "Encrypting your personal data.",
      status: RoundApplicationStatus.LitAuthentication,
    },
    {
      name: "Signing",
      description: "Signing the application metadata with your wallet.",
      status: RoundApplicationStatus.SigningApplication,
    },
    {
      name: "Storing",
      description: "The metadata is being saved in a safe place.",
      status: RoundApplicationStatus.UploadingMetadata,
    },
  ];

  const projectCreationSteps = [
    {
      name: "Linking",
      description: "Link your project to a new chain.",
      status: RoundApplicationStatus.CreateProject,
    },
  ];

  const postSteps = [
    {
      name: "Applying",
      description: "Sending your application.",
      status: RoundApplicationStatus.SendingTx,
    },
    {
      name: "Indexing",
      description: "Indexing the data.",
      status: RoundApplicationStatus.Indexing,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status: RoundApplicationStatus.Sent,
    },
  ];

  return [
    ...preSteps,
    ...(newProject ? projectCreationSteps : []),
    ...postSteps,
  ];
};

export const grantSteps: Step[] = [
  {
    name: "Storing",
    description: "The metadata is being saved in a safe place.",
    status: GrantStatus.UploadingImages,
  },
  {
    name: "Signing",
    description: "Waiting for wallet interaction.",
    status: GrantStatus.WaitingForSignature,
  },
  {
    name: "Deploying",
    description: "Connecting to the blockchain.",
    status: GrantStatus.TransactionInitiated,
  },
  {
    name: "Redirecting",
    description: "Just another moment while we finish things up.",
    status: GrantStatus.Completed,
  },
];
