import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";

export type QFDistribution = {
  projectId: string;
  matchAmountInUSD: number;
  totalContributionsInUSD: number;
  matchPoolPercentage: number;
  matchAmountInToken: BigNumber;
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

    if (roundId == "0xf9cce742ab3369745d8401dc8f40617c6da5a059") {
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
      totalContributionsInUSD: 10,
      matchPoolPercentage: 0.30,
      matchAmountInToken: parseEther('10'), // 10 DAI
      projectPayoutAddress: "0x0000000000000000000000000000000000000001",
      uniqueContributorsCount: 10,
    },
    {
      projectId: "0xaa0e74068c79c917e1232fda4096fe376fecb29b49bbb8bd0f754f0706d05f1a",
      matchAmountInUSD: 20,
      totalContributionsInUSD: 20,
      matchPoolPercentage: 0.60,
      matchAmountInToken: parseEther('20'), // 25 DAI
      projectPayoutAddress: "0x5cdb35fADB8262A3f88863254c870c2e6A848CcA",
      uniqueContributorsCount: 20,
    },
    {
      projectId: "0xc460a1506a19c6cab911d78a3072aa3def97d324fb57fa318bd3ca9d1986f36b",
      matchAmountInUSD: 30,
      totalContributionsInUSD: 30,
      matchPoolPercentage: 0.10,
      matchAmountInToken: parseEther('5'), // 5 DAI
      projectPayoutAddress: "0xB8cEF765721A6da910f14Be93e7684e9a3714123",
      uniqueContributorsCount: 30,
    }
  ];
}