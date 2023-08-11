import React from "react";

export function Header() {
  return (
    <div>
      <h1 className="text-3xl mt-5 font-thin border-b-2 pb-2">Cart</h1>

      <p className="mt-5">
        Donate to multiple projects on different rounds, with a single cart.
        Submit one transaction per chain for a seamless donation experience.
      </p>
      <p className="mt-2 mb-5">
        Please note that gas fees, particularly on Ethereum, may increase based
        on the number of projects selected.
      </p>
    </div>
  );
}
