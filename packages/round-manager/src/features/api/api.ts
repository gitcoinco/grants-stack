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

export const useRoundMatchData = (chainId: number, roundId: string) => {
  const [roundMatchData, setRoundMatchData] = useState<QFDistribution[]>();
  const [error, setError] = useState<Response | undefined>();
  const [loading, setLoading] = useState(false);

  useMemo(() => {
    setLoading(true);

    if (roundId == "0x90f301826d464708c74b437f868e6c8a3c591e5f") {
      // TODO: remove this stub
      setRoundMatchData(stubForAPI());
      setLoading(false);
      return;
    }

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
        if (data.success && data.data) {
          setRoundMatchData(data.data);
        } else {
          setError(data.message);
        }
        setLoading(false);
      });
  }, [chainId, roundId]);
  return {
    data: roundMatchData,
    error,
    loading,
  };
};


const stubForAPI = () : QFDistribution[] => {
  return [
    {
      projectId: "0x1983d697278fff78d494f87371f3b8340334ad97bf278f972648ce0789e04283",
      matchAmountInUSD: 10,
      totalContributionsInUSD: 0,
      matchPoolPercentage: 0.10,
      matchAmountInToken: 10,
      projectPayoutAddress: "0x0000000000000000000000000000000000000001",
      uniqueContributorsCount: 10,
    },
    {
      projectId: "0x8ad6e9aa51d1d15c3197d9b5304c7cc2aae40dfb1a38f919d6c4ef33888609f7",
      matchAmountInUSD: 20,
      totalContributionsInUSD: 20,
      matchPoolPercentage: 0.20,
      matchAmountInToken: 20,
      projectPayoutAddress: "0x0000000000000000000000000000000000000002",
      uniqueContributorsCount: 20,
    },
    {
      projectId: "0xc7f6c994a62837891a4913d85bf0944b6acfcffbe9972c095cfe32f32eade479",
      matchAmountInUSD: 30,
      totalContributionsInUSD: 30,
      matchPoolPercentage: 0.30,
      matchAmountInToken: 300,
      projectPayoutAddress: "0x0000000000000000000000000000000000000003",
      uniqueContributorsCount: 30,
    }
  ];
}