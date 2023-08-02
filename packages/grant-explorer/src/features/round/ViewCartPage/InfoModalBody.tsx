import React from "react";

export function InfoModalBody() {
  return (
    <div className="text-sm text-grey-400 gap-16">
      <p className="text-sm">
        Submitting your donation will require signing two transactions
        <br />
        <strong>if</strong>you are using an ERC20 token:
      </p>
      <ul className="list-disc list-inside pl-3 pt-3">
        <li>
          Approving the token allowance
          <i>
            (If you have approved enough amount previously, this step will be
            automatically skipped)
          </i>
        </li>
        <li>Approving the transaction</li>
      </ul>
    </div>
  );
}
