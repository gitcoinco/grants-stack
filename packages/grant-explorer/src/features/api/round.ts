import { ApplicationStatus } from "./types";

export type RoundProject = {
  id: string;
  status: ApplicationStatus;
  payoutAddress: string;
};
