import React, { useState } from "react";
import { Link } from "react-router-dom";
import { grantsPath, newGrantPath } from "../routes";
import Button, { ButtonVariants } from "./base/Button";
import Plus from "./icons/Plus";
import colors from "../styles/colors";
import Hamburger from "./icons/Hamburger";
import WalletDisplay from "./base/WalletDisplay";

export default function Header() {
  const [navbarOpen, setNavbarOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 sm:px-2 mb-3 text-primary-text w-full border-0 sm:border-b container mx-auto h-1/8">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
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
          <button
            type="button"
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="lg:hidden"
          >
            <div className="border-solid border rounded border-primary-text p-2">
              <Hamburger color={colors["primary-text"]} />
            </div>
          </button>
        </div>
        <div
          className={`lg:flex flex-grow items-center${
            navbarOpen ? " flex" : " hidden"
          }`}
          id="example-navbar-danger"
        >
          <div className="flex flex-col lg:flex-row list-none lg:ml-auto">
            <Link to={newGrantPath()}>
              <Button variant={ButtonVariants.primary}>
                <i className="icon">
                  <Plus color={colors["quaternary-text"]} />
                </i>
                New Project
              </Button>
            </Link>
            <WalletDisplay />
          </div>
        </div>
      </div>
    </header>
  );
}
