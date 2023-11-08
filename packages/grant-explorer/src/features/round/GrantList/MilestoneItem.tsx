import { Flex } from "@chakra-ui/react";
import { IGapGrant } from "../../api/gap";

export type TMilestone = IGapGrant["milestones"][0];
interface MilestoneItemProps {
  milestone: TMilestone;
}

export const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone }) => {
  return (
    <Flex direction="column" mr={5}>
      <small>{milestone.title}</small>
      <small>{milestone.description}</small>
    </Flex>
  );
};
