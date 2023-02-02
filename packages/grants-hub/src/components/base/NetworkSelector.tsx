import { Avatar, Menu, MenuButton, Tag, TagLabel } from "@chakra-ui/react";
import { useNetwork } from "wagmi";

export default function NetworkSelector(): JSX.Element {
  const { chain } = useNetwork();

  // todo: set this based on current chain
  const colorScheme: string = "white";

  return (
    <div className="p-2 m-2 mb-2">
      <Menu>
        <MenuButton>
          <div className="hover:cursor-default">
            <Tag size="lg" colorScheme={colorScheme} borderRadius="full">
              {(chain?.id === 69 || chain?.id === 10) && (
                <Avatar
                  src="./assets/optimism-logo.png" // todo: logo doesn't exist. file unused?
                  size="xs"
                  name="Optimism"
                  ml={-1}
                  mr={4}
                />
              )}
              <TagLabel>{chain?.name}</TagLabel>
            </Tag>
          </div>
        </MenuButton>
      </Menu>
    </div>
  );
}
