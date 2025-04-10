import {
  Box,
  Divider,
  Flex,
  Link,
  Text,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { IGapProjectUpdate, IGapProjectIndicatorData } from "../../api/gap";
import GitcoinLogo from "../../../assets/gitcoinlogo-white.svg";
import { renderToHTML } from "common/src/markdown";
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { ExpandableGrid } from "../../common/ExpandableGrid";
import { dateFromMs } from "../../api/utils";
import { useState, useMemo } from "react";

interface ActivityItemProps {
  activity: IGapProjectUpdate;
  url: string;
  projectUID?: string;
  indicatorsData: IGapProjectIndicatorData[];
  grants: {
    uid: string;
    title: string;
  }[];
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  url,
  indicatorsData,
  grants,
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(
    null
  );

  const activityImageProps = {
    bg: "green.900",
    borderRadius: "full",
    height: 8,
    width: 8,
    bgImage: GitcoinLogo,
    bgRepeat: "no-repeat",
    bgPosition: "45% 40%",
    bgSize: "50%",
  };

  // Format dates from the activity data
  const startDate = activity.data?.startDate
    ? dateFromMs(new Date(activity.data.startDate).getTime())
    : null;
  const endDate = activity.data?.endDate
    ? dateFromMs(new Date(activity.data.endDate).getTime())
    : null;

  // Process indicators by matching them with the fetched indicator data
  const indicatorsWithData = useMemo(() => {
    if (!activity.data?.indicators || activity.data.indicators.length === 0) {
      return [];
    }

    return activity.data.indicators.map((indicator) => {
      const matchedIndicator = indicatorsData?.find(
        (ind) => ind.id === indicator.indicatorId
      );

      // Get all datapoints for this indicator
      const datapoints = matchedIndicator?.datapoints || [];

      return {
        ...indicator,
        name: matchedIndicator?.name || indicator.name,
        datapoints,
      };
    });
  }, [activity.data?.indicators, indicatorsData]);

  const hasIndicators = indicatorsWithData.length > 0;
  const hasDatapoints = indicatorsWithData.some(
    (ind) => ind.datapoints?.length > 0
  );

  // Toggle indicator expansion
  const toggleIndicator = (indicatorId: string) => {
    setExpandedIndicator(
      expandedIndicator === indicatorId ? null : indicatorId
    );
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
                <Link href={`${url}?tab=updates`} target="_blank" mt={0.5}>
                  {activity.data?.title}
                </Link>
              </Text>
            </Box>
            <Flex justify="flex-end" gap={1}>
              <Box>
                <small>{startDate}</small>
              </Box>
              {startDate && endDate && (
                <Box>
                  <small>-</small>
                </Box>
              )}
              <Box>
                <small>{endDate}</small>
              </Box>
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
              dangerouslySetInnerHTML={{
                __html: renderToHTML(activity.data?.text || ""),
              }}
              className="prose-pre:whitespace-pre-wrap text-blue-800 text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600 max-w-full"
            />

            {activity.data?.deliverables &&
              activity.data.deliverables.length > 0 && (
                <Box
                  mt={4}
                  className="bg-white p-4 rounded-md flex flex-col gap-1"
                >
                  <Text fontWeight="bold" mb={2}>
                    Deliverables
                  </Text>
                  {activity.data.deliverables.map((deliverable, index) => (
                    <Box
                      key={index}
                      className="shadow-sm border border-gray-200 p-4 rounded-md flex flex-col gap-1"
                    >
                      <Text fontWeight="semibold" fontSize="lg">
                        {deliverable.name}
                      </Text>
                      {deliverable.description && (
                        <Text>{deliverable.description}</Text>
                      )}
                      {deliverable.proof && (
                        <Link
                          href={deliverable.proof}
                          color="blue.500"
                          className="mt-2 w-max flex flex-row gap-2 items-center"
                          target="_blank"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-blue-500" />
                          View Proof
                        </Link>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

            {hasIndicators && (
              <Box
                mt={4}
                className="bg-white p-4 rounded-md flex flex-col gap-1"
              >
                <Text fontWeight="bold" mb={2}>
                  Metrics
                </Text>
                {hasDatapoints ? (
                  <Box className="overflow-y-auto overflow-x-auto rounded flex flex-col gap-4 ">
                    {indicatorsWithData.map((indicator, index) => (
                      <Box
                        key={index}
                        onClick={() => toggleIndicator(indicator.indicatorId)}
                      >
                        <Text fontWeight="semibold" fontSize="md" mb={2}>
                          {indicator.name}
                        </Text>

                        {indicator.datapoints.length > 0 ? (
                          <Table
                            variant="simple"
                            size="sm"
                            className="min-w-full divide-y divide-gray-200 rounded border border-gray-200"
                          >
                            <Thead>
                              <Tr>
                                <Th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                                  Value
                                </Th>
                                <Th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                                  Start Date
                                </Th>
                                <Th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                                  End Date
                                </Th>
                                <Th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                                  Proof
                                </Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {indicator.datapoints.map(
                                (datapoint, dpIndex) => {
                                  const dpStartDate = datapoint.startDate
                                    ? dateFromMs(
                                        new Date(datapoint.startDate).getTime()
                                      )
                                    : "-";

                                  const dpEndDate = datapoint.endDate
                                    ? dateFromMs(
                                        new Date(datapoint.endDate).getTime()
                                      )
                                    : "-";

                                  return (
                                    <Tr
                                      key={dpIndex}
                                      className="hover:bg-gray-50"
                                    >
                                      <Td className="px-4 py-2 text-gray-600">
                                        {datapoint.value !== undefined
                                          ? datapoint.value
                                          : "—"}
                                      </Td>
                                      <Td className="px-4 py-2 text-gray-600">
                                        {dpStartDate}
                                      </Td>
                                      <Td className="px-4 py-2 text-gray-600">
                                        {dpEndDate}
                                      </Td>
                                      <Td className="px-4 py-2">
                                        {datapoint.proof ? (
                                          <Link
                                            href={datapoint.proof}
                                            color="blue.500"
                                            className="flex items-center gap-1 max-w-max"
                                            target="_blank"
                                          >
                                            {datapoint.proof}
                                          </Link>
                                        ) : (
                                          <Text className="text-gray-500">
                                            No proof
                                          </Text>
                                        )}
                                      </Td>
                                    </Tr>
                                  );
                                }
                              )}
                            </Tbody>
                          </Table>
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            No data available for this indicator
                          </Text>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Text color="gray.500">No metrics data available</Text>
                )}
              </Box>
            )}

            {activity.data?.grants && activity.data.grants.length > 0 && (
              <Box mt={4}>
                <Text fontWeight="bold" mb={2}>
                  Related Grants
                </Text>
                {activity.data.grants.map((grantUid, index) => (
                  <Box key={index} mb={2}>
                    <Link
                      href={`${url}/funding/${grantUid}`}
                      color="blue.500"
                      target="_blank"
                    >
                      {grants.find(
                        (grant) =>
                          grant.uid?.toLowerCase() === grantUid?.toLowerCase()
                      )?.title || "View Grant"}
                    </Link>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </ExpandableGrid>
      </Box>
    </Box>
  );
};
