import {
  Box,
  Divider,
  Flex,
  Link,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { IGapGrant } from "../../api/gap";
import GitcoinLogo from "../../../assets/gitcoinlogo-white.svg";
import { GrantCompletionBadge } from "./CompletionBadge";
import { renderToHTML } from "common/src/markdown";
import { MilestoneList } from "./MilestoneList";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ExpandableGrid } from "../../common/ExpandableGrid";
import { dateFromMs } from "../../api/utils";

interface GrantItemProps {
  grant: IGapGrant;
  url: string;
}

export const GrantItem: React.FC<GrantItemProps> = ({ grant, url }) => {
  const { isOpen, onToggle } = useDisclosure();

  const grantImageProps = {
    bg: "green.900",
    borderRadius: "full",
    height: 8,
    width: 8,
    bgImage: GitcoinLogo,
    bgRepeat: "no-repeat",
    bgPosition: "45% 40%",
    bgSize: "50%",
  };

  return (
    <Box>
      <Box bg="gray.50" borderRadius={4} p={5}>
        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <Flex
            w="full"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <Box>
              <Text fontWeight="semibold" className="flex gap-3">
                <Box {...grantImageProps} className="__grant-image" />
                <Link href={url} target="_blank" mt={0.5}>
                  {grant.title}
                </Link>
              </Text>
            </Box>
            <Flex justify="flex-end" gap={5}>
              <Box>
                <small>
                  <span className="hidden md:inline">Issued on: </span>
                  {dateFromMs(grant.createdAtMs)}
                </small>
              </Box>
              <GrantCompletionBadge milestones={grant.milestones} />
            </Flex>
          </Flex>
          <Box>
            <ChevronDownIcon
              className={`cursor-pointer h-5 inline ${
                isOpen && "rotate-180"
              } transition-transform`}
              onClick={onToggle}
            />
          </Box>
        </Flex>
        <ExpandableGrid isOpen={isOpen}>
          {!!grant.description && (
            <Box overflow="hidden">
              <Divider borderWidth={1} my={4} />
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
                  __html: renderToHTML(grant.description),
                }}
              />
            </Box>
          )}
        </ExpandableGrid>
      </Box>
      <ExpandableGrid classNames="pt-4" isOpen={isOpen}>
        <Box overflow="hidden">
          {grant.milestones.length > 0 && (
            <MilestoneList milestones={grant.milestones} />
          )}
        </Box>
      </ExpandableGrid>
      {grant.milestones.length === 0 && (
        <Text textAlign="center" mb={8}>
          No updates are available for <b>{grant.title}</b> currently. If you're
          the grant owner, you can post updates{" "}
          <Link color="blue.400" target="_blank" href={url}>
            <Text as="span" className="text-gitcoin-violet-500">
              here
            </Text>
          </Link>
          .
        </Text>
      )}
    </Box>
  );
};
