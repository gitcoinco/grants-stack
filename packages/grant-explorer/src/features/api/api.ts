import { useMemo, useState } from "react";

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

  useMemo(() => {
    setLoading(true);
    const url = `${process.env.REACT_APP_GRANTS_API_ENDPOINT}/summary/${chainId}/${roundId}`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
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

// TODO: import this type from API package
export type QFContributionSummary = {
  contributionCount: number;
  uniqueContributors: number;
  totalContributionsInUSD?: number;
  averageUSDContribution?: string;
  // FIXME: specify this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects?: any;
};

export function getProjectSummary({
  chainId,
  roundId,
  projectId,
}: {
  chainId: string;
  roundId: string;
  projectId: string;
}): Promise<{
  data: QFContributionSummary;
  success: boolean;
  message: string;
}> {
  const url = `${process.env.REACT_APP_GRANTS_API_ENDPOINT}/update/summary/project/${chainId}/${roundId}/${projectId}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((resp) => {
    if (resp.ok) {
      return resp.json();
    } else {
      throw resp;
    }
  });
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

  useMemo(() => {
    setLoading(true);
    const url = `${
      process.env.REACT_APP_GRANTS_API_ENDPOINT
    }/summary/${chainId}/${roundId}/${new URLSearchParams({ projectId })}`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
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
