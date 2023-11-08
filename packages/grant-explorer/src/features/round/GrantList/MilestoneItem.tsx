import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { IGapGrant } from "../../api/gap";
import FlagIcon from "../../../assets/icons/milestone-flag.svg";
import { renderToHTML } from "common";

export type TMilestone = IGapGrant["milestones"][0];
interface MilestoneItemProps {
  milestone: TMilestone;
  index: number;
}

export const MilestoneItem: React.FC<MilestoneItemProps> = ({
  milestone,
  index,
}) => {
  return (
    <Box
      mr={5}
      borderWidth={1}
      borderColor="gray.200"
      borderRadius="md"
      py={4}
      px={2}
    >
      <Flex
        px={3}
        pb={0.5}
        mb={5}
        gap={1.5}
        width="fit-content"
        alignItems="center"
        justifyContent="center"
        borderRadius="2xl"
        className="bg-gitcoin-violet-100 text-gitcoin-violet-400"
      >
        <Image src={FlagIcon} alt="flag-icon.svg" boxSize={4} mt={1} />
        <Text>Milestone {index}</Text>
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
    </Box>
  );
};
