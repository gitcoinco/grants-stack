import React from "react";
import { GrantItem } from "./GrantItem";
import { IGapGrant, gapAppUrl, getGapProjectUrl } from "../../api/gap";
import { Flex, Link, Text } from "@chakra-ui/react";

interface GrantListProps {
  grants: IGapGrant[];
}

export const GrantList: React.FC<GrantListProps> = ({ grants }) => {
  return (
    <Flex gap={2} flexDir="column" py={6} px={3}>
      <h4 className="text-3xl">Project milestones</h4>
      {grants.length > 0 ? (
        <>
          <Text className="text-[18px]">Total grants ({grants.length})</Text>
          {grants.map((grant, index) => (
            <GrantItem
              key={+index}
              grant={grant}
              url={getGapProjectUrl(grant.projectUID, grant.uid)}
            />
          ))}
          <Text fontFamily="DM Mono" textAlign="center" className={"text-xs"}>
            Data provided by Karma via{" "}
            <Link href={gapAppUrl} target="_blank">
              <Text as="span" className="text-gitcoin-violet-500">
                gap.karmahq.xyz
              </Text>
            </Link>
            .
          </Text>
        </>
      ) : (
        <Text>
          No previous grants are being tracked for this project. If you're the
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
