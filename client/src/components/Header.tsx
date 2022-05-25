import React from "react";
import { Link } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../reducers";
import { initializeWeb3 } from "../actions/web3";
import { grantsPath, newGrantPath } from "../routes";
import Button, { ButtonVariants } from "./base/Button";

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
    <header className="flex justify-between container mx-auto">
      <div className="flex">
        <img
          className="py-4"
          alt="Gitcoin Logo"
          src={`${process.env.PUBLIC_URL}/assets/gitcoin-logo.svg`}
        />
        <img
          alt="Gitcoin Logo Text"
          src={`${process.env.PUBLIC_URL}/assets/gitcoin-logo-text.svg`}
        />
      </div>
      {!props.web3Initialized && (
        <Button variant={ButtonVariants.outline} onClick={() => connectHandler}>
          Connect Wallet
        </Button>
      )}
      {!props.web3Error && props.web3Initialized && (
        <>
          <div className="flex flex-col justify-center">
            <p className="p">
              Welcome {props.account} (chainID: {props.chainID})
            </p>
          </div>
          <div>
            <Button
              variant={ButtonVariants.outline}
              onClick={() => connectHandler}
            >
              <Link to={grantsPath()}>Grants</Link>
            </Button>
            <Button
              variant={ButtonVariants.outline}
              onClick={() => connectHandler}
            >
              <Link to={newGrantPath()}>Create a Grant</Link>
            </Button>
          </div>
        </>
      )}
      {!props.web3Initialized && (
        <div>
          <Button
            variant={ButtonVariants.outline}
            onClick={() => connectHandler}
          >
            CONNECT
          </Button>
        </div>
      )}
    </header>
  );
}
