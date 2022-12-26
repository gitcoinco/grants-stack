import { useMemo, useState } from "react";

export type QFDistribution = {
  projectId: string;
  matchAmountInUSD: number;
  totalContributionsInUSD: number;
  matchPoolPercentage: number;
  matchAmountInToken: number;
  projectPayoutAddress: string;
  uniqueContributorsCount: number;
};

export type QFContributionSummary = {
  contributionCount: number;
  uniqueContributors: number;
  totalContributionsInUSD?: number;
  averageUSDContribution?: number;
};

export const useRoundSummary = (chainId: string, roundId: string) => {
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
};

export const useProjectSummary = (
  chainId: string,
  roundId: string,
  projectId: string
) => {
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
};

export const useRoundMatchData = (chainId: string, roundId: string) => {
  const [roundMatchData, setRoundMatchData] = useState<QFDistribution[]>();
  const [error, setError] = useState<Response | undefined>();
  const [loading, setLoading] = useState(false);

  useMemo(() => {
    setLoading(true);
    const url = `${process.env.REACT_APP_GRANTS_API_ENDPOINT}/data/match/round/${chainId}/${roundId}`;
    fetch(url, {
      method: "GET",
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
        setRoundMatchData(data);
        setLoading(false);
      });
  }, [chainId, roundId]);

  return {
    data: roundMatchData,
    error,
    loading,
  };
};
