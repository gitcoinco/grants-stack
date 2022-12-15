import { useEffect, useState } from "react";

export function useRoundSummary({
  chainId,
  roundId,
}: {
  chainId: string;
  roundId: string;
}) {
  const [roundSummary, setRoundSummary] = useState();
  const [error, setError] = useState<Response | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = `${process.env.REACT_APP_GRANTS_API_ENDPOINT}/summary/${chainId}/${roundId}`;
    fetch(url,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          console.log("error", resp.json());
          setError(resp);
          setLoading(false);
        }
      })
      .then((data) => {
        setRoundSummary(data);
        setLoading(false);
      });
  }, [chainId, roundId]);

  return {
    data: roundSummary,
    error,
    loading,
  };
}

export function useProjectSummary({
  chainId,
  roundId,
  projectId,
}: {
  chainId: string;
  roundId: string;
  projectId: string;
}) {
  const [projectSummary, setProjectSummary] = useState();
  const [error, setError] = useState<Response | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = `${process.env.REACT_APP_GRANTS_API_ENDPOINT}/summary/${chainId}/${roundId}/${new URLSearchParams({projectId})}`;
    fetch(
      url,
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
        setProjectSummary(data);
        setLoading(false);
      });
  }, [chainId, roundId, projectId]);

  return {
    data: projectSummary,
    error,
    loading,
  };
}
