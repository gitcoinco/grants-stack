import { useEffect, useState } from "react";

export function PassportWidget(props: {
  passportWidgetOpen: boolean;
  setPassportWidgetOpen: (open: boolean) => void;
  passportScore: number;
  donationImpact: number;
}) {
  return (
    <div>
      <p>Passport</p>
      <p>Passport Score: {props.passportScore}</p>
      <p>Donation Impact: {props.donationImpact}</p>
    </div>
  );
}
