import useSWR from "swr";
import { Client } from "allo-indexer-client";
import { useWallet } from "./features/common/Auth";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useDebugMode(): boolean {
  const [searchParams] = useSearchParams();

  return (
    (process.env.REACT_APP_ALLOW_URL_DEBUG_MODE === "true" &&
      searchParams.get("debug") === "true") ||
    process.env.REACT_APP_DEBUG_MODE === "true"
  );
}

export function useAlloIndexerClient(): Client {
  const { chain } = useWallet();

  return useMemo(() => {
    return new Client(
      fetch.bind(window),
      process.env.REACT_APP_ALLO_API_URL ?? "",
      chain.id
    );
  }, [chain.id]);
}

export function useRoundMatchingFunds(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/matches"], ([roundId]) => {
    return client.getRoundMatchingFunds(roundId);
  });
}

export function useRound(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/stats"], ([roundId]) => {
    return client.getRoundBy("id", roundId);
  });
}

export function useRoundApplications(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/applications"], ([roundId]) => {
    return client.getRoundApplications(roundId);
  });
}

export function useFileUpload() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [uploadedFilename, setUploadedFilename] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    acceptedFiles.forEach((file: File) => {
      setUploadedFilename(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          setUploadedData(data);
        } catch (error) {
          setError("Error parsing JSON file: " + error);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return { uploadedData, uploadedFilename, onDrop, error };
}