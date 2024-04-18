import { ReactComponent as PassportShieldGreen } from "common/src/assets/passport-shield-green.svg";
import { ReactComponent as PassportShieldYellow } from "common/src/assets/passport-shield-yellow.svg";
import { ReactComponent as PassportShieldOrange } from "common/src/assets/passport-shield-orange.svg";
import { ReactComponent as PassportShieldWhite } from "common/src/assets/passport-shield-white.svg";
import { PassportColor } from "../api/passport";

export const PassportShield = (props: { color: PassportColor }) => {
  if (props.color === "green") {
    return <PassportShieldGreen />;
  } else if (props.color === "yellow") {
    return <PassportShieldYellow />;
  } else if (props.color === "orange") {
    return <PassportShieldOrange />;
  } else if (props.color === "white") {
    return <PassportShieldWhite />;
  }
};
