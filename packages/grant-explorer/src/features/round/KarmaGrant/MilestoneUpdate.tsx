import { Box, Flex } from "@chakra-ui/react";
import { IGrantStatus } from "../../api/gap";
import InfoBaloon from "../../../assets/icons/alert-message-white.svg";
import { MilestoneBadge } from "./MilestoneBadge";
import { dateFromMs } from "../../api/utils";
import { renderToHTML } from "common/src/markdown";

export const MilestoneUpdate: React.FC<IGrantStatus> = ({
  createdAtMs,
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
        <small>Posted on {dateFromMs(createdAtMs)}</small>
      </Box>
    </Flex>
    {text ? (
      <Box
        __css={{
          h1: {
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: "1rem 0",
          },
          h2: {
            fontSize: "1.25rem",
            fontWeight: "bold",
            margin: "1rem 0",
          },
        }}
        dangerouslySetInnerHTML={{
          __html: renderToHTML(text),
        }}
      />
    ) : (
      "No update text provided"
    )}
  </Box>
);
