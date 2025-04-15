import { ActivityItem } from "./ActivityItem";
import {
  IGapGrant,
  IGapProjectUpdate,
  gapAppUrl,
  getGapProjectUrl,
  useGap,
  useGapGrants,
  useGapIndicators,
} from "../../api/gap";
import { Flex, Link, Text } from "@chakra-ui/react";

interface ActivityListProps {
  activities: IGapProjectUpdate[];
  displayKarmaAttribution?: boolean;
  projectUID?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  displayKarmaAttribution = true,
  projectUID,
}) => {
  const { indicators, isLoading: isLoadingIndicators } = useGapIndicators(
    activities?.[0]?.refUID
  );
  const { grants: grantsData } = useGapGrants(activities?.[0]?.refUID);

  return (
    <Flex gap={2} flexDir="column" py={6} px={3}>
      <h4 className="text-3xl">Project activities</h4>
      {activities.length > 0 ? (
        <>
          <Text className="text-[18px]">
            Total activities ({activities.length})
          </Text>
          {activities.map((activity) => (
            <ActivityItem
              key={activity.uid}
              activity={activity}
              url={getGapProjectUrl(activity.refUID)}
              projectUID={projectUID || activity.refUID}
              indicatorsData={indicators}
              grants={
                grantsData?.map((grant) => ({
                  uid: grant.uid,
                  title: grant.details.data.title,
                })) || []
              }
            />
          ))}
          {displayKarmaAttribution && (
            <Text fontFamily="DM Mono" textAlign="center" className={"text-xs"}>
              Data provided by Karma via{" "}
              <Link href={gapAppUrl} target="_blank">
                <Text as="span" className="text-gitcoin-violet-500">
                  gap.karmahq.xyz
                </Text>
              </Link>
              .
            </Text>
          )}
        </>
      ) : (
        <Text>
          No activities are being tracked for this project. If you're the owner
          of this project, visit{" "}
          <Link target="_blank" href={gapAppUrl}>
            <Text as="span" className="text-gitcoin-violet-500">
              gap.karmahq.xyz
            </Text>
          </Link>{" "}
          to add your project and post updates.
        </Text>
      )}
    </Flex>
  );
};
