import { useParams } from "common";

export const useProjectDetailsParams = useParams<{
  chainId: string;
  roundId: string;
  applicationId: string;
}>;
