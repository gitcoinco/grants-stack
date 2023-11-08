import React from "react";
import { GrantItem } from "./GrantItem";
import { IGapGrant, gapAppUrl, getGapProjectUrl } from "../../api/gap";
import { Flex, Link, Text } from "@chakra-ui/react";

interface GrantListProps {
  grants: IGapGrant[];
}

export const GrantList: React.FC<GrantListProps> = ({ grants }) => {
  return (
    <Flex gap={4} flexDir="column" py={6} px={3}>
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
        </>
      ) : (
        <Text>
          No previous grants are being tracked for this project. If you're the
          owner of this project, visit{" "}
          <Link color="blue.400" target="_blank" href={gapAppUrl}>
            gap.karmahq.xyz
          </Link>{" "}
          to identify your previous grants and milestones!
        </Text>
      )}
      <Text fontFamily="DM Mono" textAlign="center">
        Data provided by Karma via{" "}
        <Link href={gapAppUrl} target="_blank">
          <Text as="span" className="text-gitcoin-violet-500">
            gap.karmahq.xyz
          </Text>
        </Link>
        .
      </Text>
    </Flex>
  );
};
