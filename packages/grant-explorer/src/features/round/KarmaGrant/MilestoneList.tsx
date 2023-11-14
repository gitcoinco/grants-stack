import React, { useMemo, useState } from "react";
import { IGapGrant } from "../../api/gap";
import { Box, Flex, Tab, Tabs, Text } from "@chakra-ui/react";
import { MilestoneItem, TMilestone } from "./MilestoneItem";

interface MilestoneListProps {
  milestones: TMilestone[];
}

type TTabSet = {
  name: string;
  filter: (milestone: TMilestone) => boolean;
};

const tabs: Record<number, TTabSet> = {
  0: {
    name: "Completed",
    filter: (milestone: TMilestone) => !!milestone.completed,
  },
  1: {
    name: "Pending",
    filter: (milestone: TMilestone) => !milestone.completed,
  },
};

export const MilestoneList: React.FC<MilestoneListProps> = ({ milestones }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const amounts = useMemo(
    () =>
      Object.values(tabs).map(({ filter }) => milestones.filter(filter).length),
    [milestones]
  );

  const showing: IGapGrant["milestones"] = useMemo(
    () => milestones.filter(tabs[selectedTab].filter),
    [selectedTab, milestones]
  );

  const getAmountTextProps = (index: number) => {
    const isSelected = selectedTab === index;
    return {
      color: isSelected ? "blue" : "gray.500",
      bg: isSelected ? "blue.100" : "gray.200",
    };
  };

  const getTabProps = (index: number) => {
    const isSelected = selectedTab === index;
    return {
      color: "black",
      border: "none",
      rounded: "3xl",
      py: 1,
      px: 3,
      _notFirst: { ml: 2 },
      mt: "-2px",
      fontWeight: isSelected ? "semibold" : "normal",
      bg: isSelected ? "white" : "transparent",
      shadow: isSelected ? "sm" : "none",
    };
  };

  const getBadgeTitle = (milestone: TMilestone) => {
    const type = milestone.isGrantUpdate ? "Update" : "Milestone";

    let count = 0;
    for (const item of showing) {
      count += item.isGrantUpdate === milestone.isGrantUpdate ? 1 : 0;
      if (milestone.uid === item.uid) break;
    }
    return `${type} ${count}`;
  };

  const milestoneCount = milestones.filter(
    (milestone) => !milestone.isGrantUpdate
  ).length;

  return (
    <Box py={3}>
      <Flex
        alignItems="center"
        className="justify-center md:justify-between"
        flexWrap="wrap"
      >
        <Flex
          gap={5}
          alignItems="center"
          className="justify-center md:justify-normal"
          flexWrap="wrap"
        >
          <Box>
            <Text mt="-5px" fontWeight="semibold">
              Milestones
            </Text>
          </Box>
          <Box bg="gray.100" borderRadius="3xl" p={1.5}>
            <Tabs display="flex" onChange={setSelectedTab} borderRadius="2xl">
              {Object.keys(tabs).map((key, index) => (
                <Tab key={+key} {...getTabProps(index)} fontSize={["xs", "sm"]}>
                  <Flex gap={3} alignItems="center">
                    <Box mt="-2px">{tabs[+key].name}</Box>
                    <Flex
                      {...getAmountTextProps(index)}
                      px={3}
                      borderRadius="xl"
                    >
                      <Text mt="-2px" fontWeight="semibold">
                        {amounts[index]}
                      </Text>
                    </Flex>
                  </Flex>
                </Tab>
              ))}
            </Tabs>
          </Box>
        </Flex>
        <Box>
          <Text>
            <small>
              {milestoneCount} milestones, {milestones.length - milestoneCount}{" "}
              updates in this grant.
            </small>
          </Text>
        </Box>
      </Flex>

      <Box pt={7}>
        {showing.length > 0 ? (
          <Flex gap={5} flexDir="column">
            {showing.map((milestone, index) => (
              <MilestoneItem
                key={+index}
                milestone={milestone}
                badgeTitle={getBadgeTitle(milestone)}
              />
            ))}
          </Flex>
        ) : (
          <Box textAlign="center">
            <Text fontWeight="semibold">
              There are no {tabs[selectedTab].name.toLowerCase()} milestones.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
