import React from "react";
import { GrantItem } from "./GrantItem";
import { IGapGrant } from "../../api/gap";
import { Flex } from "@chakra-ui/react";

interface GrantListProps {
  grants: IGapGrant[];
}

export const GrantList: React.FC<GrantListProps> = ({ grants }) => {
  return (
    <Flex gap={4} flexDir="column">
      {grants.map((grant) => (
        <GrantItem key={grant.uid} grant={grant} />
      ))}
    </Flex>
  );
};
