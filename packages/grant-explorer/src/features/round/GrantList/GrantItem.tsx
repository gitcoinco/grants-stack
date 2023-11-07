import { Box, Divider, Flex, Link } from "@chakra-ui/react";
import { IGapGrant } from "../../api/gap";
import { useMemo } from "react";
import { CardTitle } from "../../common/styles";
import GitcoinLogo from "../../../assets/gitcoinlogo-white.svg";
import { GrantCompletionBadge } from "./CompletionBadge";
import { renderToHTML } from "common/src/markdown";

interface GrantItemProps {
  grant: IGapGrant;
}

const gapAppUrl = "https://gapstag.karmahq.xyz/project";

export const GrantItem: React.FC<GrantItemProps> = ({ grant }) => {
  const gapUrl = useMemo(
    () => `${gapAppUrl}/${grant.projectUID}/?tab=grants&grant=${grant.uid}`,
    [grant]
  );

  const dateFromMs = (ms: number) => {
    const date = new Date(ms);
    return Intl.DateTimeFormat(/*navigator?.language ||*/ "en-US", {
      dateStyle: "medium",
    }).format(date);
  };

  return (
    <Box bg="gray.50" borderRadius={4} p={5}>
      <Flex alignItems="center" justifyContent="space-between">
        <Box>
          <CardTitle className="flex gap-3">
            <Box
              bg="green.900"
              borderRadius="full"
              height={8}
              width={8}
              bgImage={GitcoinLogo}
              bgRepeat="no-repeat"
              bgPosition="45% 40%"
              bgSize="50%"
            />
            <Link href={gapUrl} target="_blank">
              {grant.title}
            </Link>
          </CardTitle>
        </Box>
        <Flex justify="flex-end" gap={5}>
          <Box>
            <small>Issued on: {dateFromMs(grant.createdAt)}</small>
          </Box>
          <GrantCompletionBadge milestones={grant.milestones} />
        </Flex>
      </Flex>
      <Divider borderWidth={1} my={4} />
      <Box
        dangerouslySetInnerHTML={{ __html: renderToHTML(grant.description) }}
      />
    </Box>
  );
};
