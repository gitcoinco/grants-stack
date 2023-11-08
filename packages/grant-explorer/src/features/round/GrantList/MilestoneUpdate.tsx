import { Box, Flex } from "@chakra-ui/react";
import { IGrantStatus } from "../../api/gap";
import InfoBaloon from "../../../assets/icons/alert-message-white.svg";
import { MilestoneBadge } from "./MilestoneBadge";
import { dateFromMs } from "../../api/utils";

export const MilestoneUpdate: React.FC<IGrantStatus> = ({
  createdAt,
  text,
}) => (
  <Box p={4} ml={5} className="bg-gitcoin-violet-100" borderRadius="md">
    <Flex justifyContent="space-between" mb={5}>
      <MilestoneBadge
        icon={InfoBaloon}
        title="Update"
        classNames="bg-gitcoin-violet-500 text-white"
      />
      <Box>
        <small>Posted on {dateFromMs(createdAt)}</small>
      </Box>
    </Flex>
    {text}
  </Box>
);
