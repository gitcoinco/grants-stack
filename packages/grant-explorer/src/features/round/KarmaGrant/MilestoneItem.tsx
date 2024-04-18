import { Box, Divider, Flex, Text } from "@chakra-ui/react";
import { IGapGrant } from "../../api/gap";
import FlagIcon from "../../../assets/icons/milestone-flag.svg";
import { renderToHTML } from "common";
import { MilestoneUpdate } from "./MilestoneUpdate";
import { MilestoneBadge } from "./MilestoneBadge";
import { dateFromMs } from "../../api/utils";
import { useMemo } from "react";

export type TMilestone = IGapGrant["milestones"][0];
interface MilestoneItemProps {
  milestone: TMilestone;
  badgeTitle: string;
}

export const MilestoneItem: React.FC<MilestoneItemProps> = ({
  milestone,
  badgeTitle,
}) => {
  const deadlineText = milestone.completed
    ? `${milestone.isGrantUpdate ? "Posted" : "Completed"} on ${dateFromMs(
        milestone.completed.createdAtMs
      )}`
    : `Due on ${dateFromMs(milestone.endsAtMs)}`;

  const statusBadgeProps = useMemo(() => {
    if (milestone.endsAtMs < Date.now() / 1000) {
      return {
        title: "Past due",
        classNames: "bg-red-500 text-white",
      };
    }

    return milestone.completed
      ? {
          title: "Completed",
          classNames: "bg-gray-100",
        }
      : {
          title: "Pending",
          classNames: "bg-gray-500 text-white",
        };
  }, [milestone]);

  return (
    <Box borderWidth={1} borderColor="gray.200" borderRadius="md" py={4} px={2}>
      <Flex justifyContent="space-between" mb={5} flexWrap="wrap">
        <Flex
          justifyContent="space-between"
          w={["full", "full", "full", "fit-content"]}
        >
          <MilestoneBadge icon={FlagIcon} title={badgeTitle} />
          <Box className="initial lg:hidden">
            {!milestone.isGrantUpdate && (
              <MilestoneBadge {...statusBadgeProps} />
            )}
          </Box>
        </Flex>
        <Flex gap={5} alignItems="center">
          <Text mt="-2px">
            <small>{deadlineText}</small>
          </Text>
          <Box className="hidden lg:flex">
            {!milestone.isGrantUpdate && (
              <MilestoneBadge {...statusBadgeProps} />
            )}
          </Box>
        </Flex>
      </Flex>
      <Flex mb={3}>
        <Text fontWeight="bold">{milestone.title}</Text>
      </Flex>
      <Flex>
        <Box
          dangerouslySetInnerHTML={{
            __html: renderToHTML(milestone.description),
          }}
        />
      </Flex>
      {!!milestone.completed?.text && !milestone.isGrantUpdate && (
        <>
          <Divider my={3} />
          <MilestoneUpdate {...milestone.completed} />
        </>
      )}
    </Box>
  );
};
