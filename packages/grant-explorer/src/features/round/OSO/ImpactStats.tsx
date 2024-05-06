import React from "react";
import { IOSOStats } from "../../api/oso";
import { Flex, Link, Text } from "@chakra-ui/react";
import { Stat } from "../ViewProjectDetails";
import { formatTimeAgo } from "../../common/utils/utils";


export const StatList = ({ stats }: { stats: IOSOStats | null }) => {
  if (stats === null) return;
  return (
    stats.code_metrics_by_project.contributors > 0 ? (
      <React.Fragment>
        <h4 className="text-3xl mt-5 ml-4" >Impact stats</h4>
        <Flex gap={2} flexDir={{base: 'column', md: 'row'}} py={6} px={3} >
          <div 
            className={
            "rounded-2xl bg-gray-50 flex-auto p-3 md:p-6 gap-4 flex flex-col"
            }
          >
            <div> <Stat
              isLoading={false}
              value={`${formatTimeAgo(stats.code_metrics_by_project.first_commit_date)}`}
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
            value={`${stats.code_metrics_by_project.contributors}`}
          >
            Unique code contributors
          </Stat>
        </div>
        <div 
          className={
          "rounded-2xl bg-gray-50 flex-auto p-3 md:p-6 gap-4 flex flex-col"
          }
        >
          <Stat
            isLoading={false}
            value={`${projectVelocity(stats)}`}
          >
            Velocity
          </Stat>
        </div>
      </Flex>
      <Text fontFamily="DM Mono" textAlign="center" mt={0} className={"text-xs"}>
        Data provided by {" "}
        <Link href={"https://www.opensource.observer/"} target="_blank">
          <Text as="span" className="text-gitcoin-violet-500">  
            opensource.observer
          </Text>
        </Link>
      </Text>
      </React.Fragment>
    ) : (
      <div>
      </div>
    )
  );
};

function projectVelocity(stats : IOSOStats) {
  const recentCommits = stats.events_monthly_to_project[0].amount + stats.events_monthly_to_project[1].amount + stats.events_monthly_to_project[2].amount;
  const olderCommits = stats.events_monthly_to_project[3].amount + stats.events_monthly_to_project[4].amount + stats.events_monthly_to_project[5].amount;

  if (recentCommits === 0 && olderCommits === 0) return 'unknown';
  if (recentCommits >= (1.5 * olderCommits)) return 'increasing'; 
  if (recentCommits <= 0.5 * olderCommits) return 'decreasing';
  return 'steady';
}