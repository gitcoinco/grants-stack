import React from "react";
import { Link } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../reducers";
import { initializeWeb3 } from "../actions/web3";
import { grantsPath, newGrantPath } from "../routes";
import Button, { ButtonVariants } from "./base/Button";
import Plus from "./icons/Plus";
import colors from "../styles/colors";
import { shortAddress } from "../utils/wallet";
import { ChainLogos, Blockchain } from "./icons/Blockchain";

export default function Header() {
  const dispatch = useDispatch();
  const props = useSelector(
    (state: RootState) => ({
      web3Initialized: state.web3.initialized,
      web3Error: state.web3.error,
      chainID: state.web3.chainID,
      account: state.web3.account,
    }),
    shallowEqual
  );

  const connectHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(initializeWeb3());
  };
  return (
    <header className="justify-between container mx-auto border-b mb-4 sm:flex xs:flex-col sm:h-20 xs:h-40">
      <Link to={grantsPath()}>
        <div className="flex items-center">
          <img
            className="py-4"
            alt="Gitcoin Logo"
            src="./assets/gitcoin-logo.svg"
          />
          <h3 className="ml-6 mt-1">Grant Hub</h3>
        </div>
      </Link>

      <div className="flex items-center">
        <Link to={newGrantPath()}>
          <Button variant={ButtonVariants.primary}>
            <Plus color={colors["quaternary-text"]} />
            New Project
          </Button>
        </Link>
        <Button variant={ButtonVariants.outline} onClick={() => connectHandler}>
          <Blockchain chain={ChainLogos.ETH} />
          {props.account ? shortAddress(props.account) : "Connect Wallet"}
        </Button>
      </div>
    </header>
  );
}
