import { useState } from "react";
import { useAllo } from "common";
import { Address } from "viem";

enum CreateProgramStep {
  STORING = 0,
  EXECUTING_RANSACTION,
  WAITING_FOR_TRANSACTION,
  INDEXING,
}

export type CreateProgramState =
  | {
      type: "idle";
    }
  | {
      type: "creating";
      step: CreateProgramStep;
      error: Error | null;
    }
  | {
      type: "error";
      error: Error;
    }
  | {
      type: "created";
      programId: string;
    };

export const useCreateProgram = () => {
  const [state, setState] = useState<CreateProgramState>({ type: "idle" });
  const allo = useAllo();

  const createProgram = async (
    programName: string,
    operatorWallets: Address[]
  ) => {
    try {
      if (allo === null) {
        throw new Error("Allo is not available");
      }

      setState({
        type: "creating",
        step: CreateProgramStep.STORING,
        error: null,
      });

      const result = await allo
        .createProgram({
          name: programName,
          memberAddresses: operatorWallets,
        })
        .on("ipfs", (result) => {
          if (result.type === "success") {
            setState({
              type: "creating",
              step: CreateProgramStep.EXECUTING_RANSACTION,
              error: null,
            });
          }
        })
        .on("transaction", (result) => {
          if (result.type === "success") {
            setState({
              type: "creating",
              step: CreateProgramStep.WAITING_FOR_TRANSACTION,
              error: null,
            });
          }
        })
        .on("transactionStatus", (result) => {
          if (result.type === "success") {
            setState({
              type: "creating",
              step: CreateProgramStep.INDEXING,
              error: null,
            });
          }
        })
        .on("indexingStatus", (result) => {
          if (result.type !== "success") {
            setState({
              type: "creating",
              step: CreateProgramStep.INDEXING,
              error: result.error,
            });
          }
        })
        .execute();

      if (result.type === "success") {
        setState({
          type: "created",
          programId: result.value.programId,
        });
      } else {
        setState((state) => {
          if (state.type === "creating") {
            return {
              type: "creating",
              step: state.step,
              error: result.error,
            };
          }

          return {
            type: "error",
            error: result.error,
          };
        });
      }
    } catch (error) {
      setState({
        type: "error",
        error:
          error instanceof Error ? error : new Error(`Unknown error ${error}`),
      });
    }
  };

  return {
    createProgram,
    state,
  };
};
