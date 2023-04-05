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
  projectId: string,
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

    if (roundId == "0xd1184de83aa87512e79646c78b5e60fbf836afad") {
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

const stubForAPI = (): QFDistribution[] => {
  return [
    {
      projectId:
        "0x2525938e0221c345f602672f71f936f50a82a8ebf57cec7f3777ecac5ad44886",
      matchAmountInUSD: 10,
      totalContributionsInUSD: 10,
      matchPoolPercentage: 0.3,
      matchAmountInToken: parseEther("0.001"),
      projectPayoutAddress: "0x997D35b300bA1775fdB175dF045252e57D6EA5B0",
      uniqueContributorsCount: 10,
    },
    {
      projectId:
        "0x3f4241566efa1a8bbcd705e733e396e2e525de48d6cd0a8024cdd73b5a930d94",
      matchAmountInUSD: 20,
      totalContributionsInUSD: 20,
      matchPoolPercentage: 0.6,
      matchAmountInToken: parseEther("0.002"),
      projectPayoutAddress: "0x500Df079BEBE24A9f6FFa2c70fb58000A4722784",
      uniqueContributorsCount: 20,
    },
    {
      projectId:
        "0x950e82e811c5a080c0f1bf477874b4a19436766c1fdd17b48b01c0566c7feb05",
      matchAmountInUSD: 30,
      totalContributionsInUSD: 30,
      matchPoolPercentage: 0.3,
      matchAmountInToken: parseEther("0.002"),
      projectPayoutAddress: "0xB8cEF765721A6da910f14Be93e7684e9a3714123",
      uniqueContributorsCount: 30,
    },
  ];
};
