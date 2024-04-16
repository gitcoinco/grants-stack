import { ReactComponent as PassportShieldGreen } from "common/src/assets/passport-shield-green.svg";
// import { ReactComponent as PassportShieldYellow } from "../assets/passport-shield-yellow.svg";
// import { ReactComponent as PassportShieldRed } from "../assets/passport-shield-red.svg";
// import { ReactComponent as PassportShieldWhite } from "../assets/passport-shield-white.svg";

type passportColor = "green" | "yellow" | "orange" | "white";

export const PassportShield = (props: { color: passportColor }) => {
  if (props.color === "green") {
    return <PassportShieldGreen />;
  } else if (props.color === "yellow") {
    // return <PassportShieldYellow />;
  } else if (props.color === "orange") {
    // return <PassportShieldRed />;
  } else if (props.color === "white") {
    // return <PassportShieldWhite />;
  }
};
