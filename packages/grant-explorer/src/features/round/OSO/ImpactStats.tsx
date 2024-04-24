import React from "react";
//import { GrantItem } from "./GrantItem";
import { IOSOStats } from "../../api/oso";
import { Flex, Link, Text } from "@chakra-ui/react";
import { Stat } from "../ViewProjectDetails";


export const StatList = ({ stats }: { stats: IOSOStats }) => {
  return (
    stats.code_metrics_by_project.contributors > 0 ? (
      <React.Fragment>
      <Flex gap={2} flexDir="row" py={6} px={3}>
      <div className={
      "rounded-1x3 bg-gray-50 mb-4 p-4 gap-4 grid grid-cols-3 md:flex md:flex-col"
      } >
      <Stat
        isLoading={false}
        value={`${formatTimeAgo(stats.code_metrics_by_project.first_commit_date)}`}
      >
        Project age
      </Stat>
      </div>
      <div className={
        "rounded-1x3 bg-gray-50 mb-4 p-4 gap-4 grid grid-cols-3 md:flex md:flex-col"
      } >
      <Stat
        isLoading={false}
        value={`${stats.code_metrics_by_project.contributors}`}
      >
        Total unique contributors
      </Stat></div>
      <div className={
        "rounded-1x3 bg-gray-50 mb-4 p-4 gap-4 grid grid-cols-3 md:flex md:flex-col"
      } >
      <Stat
        isLoading={false}
        value={`${stats.code_metrics_by_project.contributors}`}
      >
        Velocity
      </Stat></div>
    </Flex>
    <Text fontFamily="DM Mono" textAlign="center">
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
        test
      </div>
  ));
};

function formatTimeAgo(dateString : number) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime()); // Difference in milliseconds
  const diffMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30)); // Convert to months

  if (diffMonths === 0) {
    return 'This month';
  } else if (diffMonths === 1) {
    return 'Last month';
  } else {
    return `${diffMonths} months ago`;
  }
}