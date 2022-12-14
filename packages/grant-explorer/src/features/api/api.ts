import { useEffect, useState } from "react";

export function useRoundStats({
  chainId,
  roundId,
}: {
  chainId: string;
  roundId: string;
}) {
  const [roundStats, setRoundStats] = useState();
  const [error, setError] = useState<Response | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(
      process.env.GRANTS_API_ENDPOINT +
        "/round-stats?" +
        new URLSearchParams({
          chainId,
          roundId,
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          console.log("error", resp.json());
          setError(resp);
          setLoading(false);
        }
      })
      .then((data) => {
        setRoundStats(data);
        setLoading(false);
      });
  }, [chainId, roundId]);

  return {
    data: roundStats,
    error,
    loading,
  };
}

export function useProjectStats({
  chainId,
  roundId,
  projectId,
}: {
  chainId: string;
  roundId: string;
  projectId: string;
}) {
  const [roundStats, setRoundStats] = useState();
  const [error, setError] = useState<Response | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(
      process.env.GRANTS_API_ENDPOINT +
        "/project-stats?" +
        new URLSearchParams({
          chainId,
          roundId,
          projectId,
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          setError(resp);
          setLoading(false);
        }
      })
      .then((data) => {
        setRoundStats(data);
        setLoading(false);
      });
  }, [chainId, roundId, projectId]);

  return {
    data: roundStats,
    error,
    loading,
  };
}
