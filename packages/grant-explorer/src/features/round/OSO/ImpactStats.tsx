import React from "react";
import { IOSOStats } from "../../api/oso";
import { Flex, Link, Text } from "@chakra-ui/react";
import { Stat } from "../ViewProjectDetails";
import { formatTimeAgo } from "../../common/utils/utils";

export const StatList = ({ stats }: { stats: IOSOStats | null }) => {
  if (stats === null) return;
  return stats.oso_codeMetricsByProjectV1[0].contributorCount > 0 ? (
    <React.Fragment>
      <h4 className="text-3xl mt-5 ml-4">Impact stats</h4>
      <Flex gap={2} flexDir={{ base: "column", md: "row" }} py={6} px={3}>
        <div
          className={
            "rounded-2xl bg-gray-50 flex-auto p-3 md:p-6 gap-4 flex flex-col"
          }
        >
          <div>
            {" "}
            <Stat
              isLoading={false}
              value={`${formatTimeAgo(stats.oso_codeMetricsByProjectV1[0].firstCommitDate)}`}
            >
              Project age
            </Stat>
          </div>
        </div>
        <div
          className={
            "rounded-2xl bg-gray-50 flex-auto p-3 md:p-6 gap-4 flex flex-col"
          }
        >
          <Stat
            isLoading={false}
            value={`${stats.oso_codeMetricsByProjectV1[0].contributorCount}`}
          >
            Unique code contributors
          </Stat>
        </div>
        <div
          className={
            "rounded-2xl bg-gray-50 flex-auto p-3 md:p-6 gap-4 flex flex-col"
          }
        >
          <Stat isLoading={false} value={`${projectDevs(stats)}`}>
            Active devs
          </Stat>
        </div>
      </Flex>
      <Text
        fontFamily="DM Mono"
        textAlign="center"
        mt={0}
        className={"text-xs"}
      >
        Data provided by{" "}
        <Link href={"https://www.opensource.observer/"} target="_blank">
          <Text as="span" className="text-gitcoin-violet-500">
            opensource.observer
          </Text>
        </Link>
      </Text>
    </React.Fragment>
  ) : (
    <div></div>
  );
};

function projectDevs(stats: IOSOStats) {
  return stats.oso_codeMetricsByProjectV1[0].activeDeveloperCount6Months;
}
