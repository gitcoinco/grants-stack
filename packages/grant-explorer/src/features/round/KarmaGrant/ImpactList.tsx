import { ImpactItem } from "./ImpactItem";
import { IGapImpact, gapAppUrl, getGapProjectImpactUrl } from "../../api/gap";
import { Flex, Link, Text } from "@chakra-ui/react";

interface ImpactListProps {
  impacts: IGapImpact[];
  displayKarmaAttribution?: boolean;
}

export const ImpactList: React.FC<ImpactListProps> = ({
  impacts,
  displayKarmaAttribution = true,
}) => {
  return (
    <Flex gap={2} flexDir="column" py={6} px={3}>
      <h4 className="text-3xl">Project impacts</h4>
      {impacts.length > 0 ? (
        <>
          <Text className="text-[18px]">Total impacts ({impacts.length})</Text>
          {impacts.map((impact) => (
            <ImpactItem
              key={impact.uid}
              impact={impact}
              url={getGapProjectImpactUrl(impact.refUID)}
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
          No previous impacts are being tracked for this project. If you're the
          owner of this project, visit{" "}
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
