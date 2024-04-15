import { Button, Input } from "common/src/styles";
import React from "react";
import { PayoutTokenDropdown } from "./PayoutTokenDropdown";

export function EmptyCart() {
  return (
    <div className="grow block px-[16px] py-4 rounded-lg shadow-lg bg-white border border-violet-400">
      <div className="flex flex-col md:flex-row justify-between border-b-2 pb-2 gap-3">
        <div className="basis-[28%]">
          <h2 className="mt-2 text-xl">Projects</h2>
        </div>
        <div className="flex justify-end flex-row gap-2 basis-[72%]">
          <p className="mt-4 md:mt-3 text-xs md:text-sm amount-text">Amount</p>
          <Input
            aria-label={"Donation amount for all projects "}
            id={"input-donationamount"}
            min="0"
            value={""}
            type="number"
            className="w-16 md:w-24"
          />
          <PayoutTokenDropdown
            setSelectedPayoutToken={() => {
              {
                /*Do nothing when cart is empty*/
              }
            }}
            payoutTokenOptions={[]}
          />
          <Button
            type="button"
            disabled={true}
            $variant="outline"
            className="text-sm px-0 md:px-4 py-2 text-blue-200 border-0"
          >
            Apply to all
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-grey-500">Cart is empty.</p>
      </div>
    </div>
  );
}
