import {
  Avatar,
  AvatarBadge,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
//! I couldn't get this damn chevron to display 🤬
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import { web3AccountDisconnected } from "../../actions/web3";
import { slugs } from "../../routes";
import { shortAddress, isValidAddress } from "../../utils/wallet";

export default function WalletDisplay(): JSX.Element {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect({
    onSuccess() {
      dispatch(web3AccountDisconnected(""));
      navigate(slugs.root);
      //
    },
    onError(error) {
      dispatch({ type: "WEB3_ERROR", error });
    },
  });

  const avatarBg = isConnected ? "green.500" : "red.500";

  return (
    <div className="p-2 m-2 mb-2 mt-3">
      <Menu>
        <MenuButton>
          <Avatar size="xs">
            <AvatarBadge boxSize="1.25em" bg={avatarBg} />
          </Avatar>{" "}
          {isConnected && isValidAddress(address!)
            ? shortAddress(address!)
            : "Not Connected"}
        </MenuButton>
        <MenuList>
          {isConnected ? (
            <MenuItem minH="40px" onClick={() => disconnect()}>
              <span>Disconnect</span>
            </MenuItem>
          ) : (
            <ConnectButton />
          )}
        </MenuList>
      </Menu>
    </div>
  );
}
