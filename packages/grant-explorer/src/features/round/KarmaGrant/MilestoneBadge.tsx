import { Flex, FlexProps, Image, Text } from "@chakra-ui/react";
import React from "react";

interface MilestoneBadgeProps {
  icon?: string;
  title: string;
  flexProps?: FlexProps;
  classNames?: string;
}

export const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
  icon,
  title,
  flexProps,
  classNames = "",
}) => (
  <Flex
    px={3}
    pb={0.5}
    gap={1.5}
    width="fit-content"
    alignItems="center"
    justifyContent="center"
    borderRadius="2xl"
    className={classNames || "bg-gitcoin-violet-100 text-gitcoin-violet-400"}
    {...flexProps}
  >
    {!!icon && <Image src={icon} alt="flag-icon.svg" boxSize={4} mt={1} />}
    <Text>{title}</Text>
  </Flex>
);
