import { ReactComponent as LandingBannerLogo } from "./landing-banner.svg";
import { ComponentProps } from "react";

export default (props: ComponentProps<"svg">) => (
  <LandingBannerLogo {...props} />
);
