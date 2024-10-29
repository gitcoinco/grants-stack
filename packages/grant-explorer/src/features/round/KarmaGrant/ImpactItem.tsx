import {
  Box,
  Divider,
  Flex,
  Link,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import GitcoinLogo from "../../../assets/gitcoinlogo-white.svg";
import { renderToHTML } from "common/src/markdown";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ExpandableGrid } from "../../common/ExpandableGrid";
import { dateFromMs } from "../../api/utils";
import { FC } from "react";
import { IGapImpact } from "../../api/gap";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useEnsName } from "wagmi";

interface ImpactItemProps {
  impact: IGapImpact;
  url: string;
}
const EthereumAddressToENSName: FC<{
  address: `0x${string}`;
  shouldTruncate?: boolean;
}> = ({ address, shouldTruncate = true }) => {
  const { data: ensName } = useEnsName({
    address,
  });
  const lowerCasedAddress = address.toLowerCase();
  const addressToDisplay = shouldTruncate
    ? lowerCasedAddress?.slice(0, 6) + "..." + lowerCasedAddress?.slice(-6)
    : lowerCasedAddress;

  return <span className="font-body">{ensName || addressToDisplay}</span>;
};

export const ImpactItem: React.FC<ImpactItemProps> = ({ impact, url }) => {
  const { isOpen, onToggle } = useDisclosure();

  const impactImageProps = {
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
    <Box mb={4}>
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
                <Box {...impactImageProps} className="__impact-image" />
                <Link href={url} target="_blank" className="ml-2 max-w-lg">
                  {impact.data?.impact &&
                  impact.data.impact.split(" ").length > 20
                    ? `${impact.data.impact.split(" ").slice(0, 20).join(" ")}...`
                    : impact.data?.impact}
                </Link>
              </Text>
            </Box>
            <Flex justify="flex-end" gap={5}>
              <Box>
                <small>
                  <span className="hidden md:inline">Completed on: </span>
                  {impact.data?.completedAt
                    ? dateFromMs(impact.data.completedAt * 1000)
                    : "N/A"}
                </small>
              </Box>
              {impact.verified.length > 0 && (
                <div className="bg-teal-100 flex gap-2 rounded-full px-2 text-xs items-center font-modern-era-medium text-teal-500">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Verified
                </div>
              )}
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
            >
              <Text fontWeight="bold" mb={2}>
                Work:
              </Text>
              <Box
                dangerouslySetInnerHTML={{
                  __html: renderToHTML(impact.data?.work || ""),
                }}
              />

              <Text fontWeight="bold" mt={4} mb={2}>
                Impact:
              </Text>
              <Box
                dangerouslySetInnerHTML={{
                  __html: renderToHTML(impact.data?.impact || ""),
                }}
              />

              <Text fontWeight="bold" mt={4} mb={2}>
                Proof:
              </Text>
              <Link href={impact.data?.proof} target="_blank" color="blue.500">
                {impact.data?.proof}
              </Link>

              {impact.verified.length > 0 && (
                <>
                  <Text fontWeight="bold" mt={4} mb={2}>
                    Verifications:
                  </Text>
                  {Array.from(
                    new Set(impact.verified.map((v) => v.attester))
                  ).map((attester, index) => (
                    <Text key={index}>
                      Verified by:{" "}
                      <EthereumAddressToENSName address={attester} />
                    </Text>
                  ))}
                </>
              )}

              <Text fontWeight="bold" mt={4} mb={2}>
                Timeframe:
              </Text>
              <Text>
                {impact.data?.startedAt
                  ? dateFromMs(impact.data?.startedAt * 1000)
                  : "N/A"}
                {" → "}
                {impact.data?.completedAt
                  ? dateFromMs(impact.data?.completedAt * 1000)
                  : "N/A"}
              </Text>
            </Box>
          </Box>
        </ExpandableGrid>
      </Box>
    </Box>
  );
};
