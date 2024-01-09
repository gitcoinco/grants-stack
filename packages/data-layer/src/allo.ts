import { TransactionExecutorResult } from "./transaction-executor";

export interface Allo {
  createProject: (args: {
    name: string;
    metadataCid: string;
  }) => Promise<TransactionExecutorResult>;
  updateProjectMetadata: (args: {
    projectId: bigint;
    newMetadataCid: string;
  }) => Promise<TransactionExecutorResult>;
}
