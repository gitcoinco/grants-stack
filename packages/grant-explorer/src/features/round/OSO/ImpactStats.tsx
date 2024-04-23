import React from "react";
//import { GrantItem } from "./GrantItem";
import { IOSOGrant } from "../../api/oso";
import { Flex, Link, Text } from "@chakra-ui/react";
import { Stat } from "../ViewProjectDetails";

interface StatListProps {
    stats: IOSOGrant;
  }

export const StatList: React.FC<StatListProps> = ({ stats }) => {
  return (
    stats.createdAtMs > 0 ? (
        <div>
        test
      </div>
      ) : (
        <React.Fragment>
        <Flex gap={2} flexDir="row" py={6} px={3}>
        <div
      className={
        "rounded-1x3 bg-gray-50 mb-4 p-4 gap-4 grid grid-cols-3 md:flex md:flex-col"
      }
    >
      <Stat
        isLoading={false}
        value={`$${stats.createdAtMs}`}
      >
        Project age
      </Stat>
    </div>
    <div
      className={
        "rounded-1x3 bg-gray-50 mb-4 p-4 gap-4 grid grid-cols-3 md:flex md:flex-col"
      }
    >
      <Stat
        isLoading={false}
        value={`$${stats.createdAtMs}`}
      >
        Total unique contributors
      </Stat></div>
      <div
      className={
        "rounded-1x3 bg-gray-50 mb-4 p-4 gap-4 grid grid-cols-3 md:flex md:flex-col"
      }
    >
      <Stat
        isLoading={false}
        value={`$${stats.createdAtMs}`}
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
  ));
};
