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
  // 2: {
  //   name: "All",
  //   filter: () => true,
  // },
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
      fontWeight: isSelected ? "semibold" : "normal",
      bg: isSelected ? "white" : "transparent",
      shadow: isSelected ? "sm" : "none",
    };
  };

  return (
    <Box py={3}>
      <Flex gap={5} alignItems="center">
        <Box>
          <Text mt="-5px" fontWeight="semibold">
            Milestones
          </Text>
        </Box>
        <Box bg="gray.100" borderRadius="3xl" p={1.5}>
          <Tabs display="flex" onChange={setSelectedTab} borderRadius="2xl">
            {Object.keys(tabs).map((key, index) => (
              <Tab
                key={+key}
                color="black"
                border="none"
                rounded="3xl"
                py={1}
                px={3}
                _notFirst={{ ml: 2 }}
                mt="-2px"
                {...getTabProps(index)}
              >
                <Flex gap={3} alignItems="center">
                  <Box mt="-2px">{tabs[+key].name}</Box>
                  <Flex {...getAmountTextProps(index)} px={3} borderRadius="xl">
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
      <Box pt={10}>
        {showing.length > 0 ? (
          <Flex gap={5} flexDir="column">
            {showing.map((milestone, index) => (
              <MilestoneItem
                key={+index}
                milestone={milestone}
                index={index + 1}
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
