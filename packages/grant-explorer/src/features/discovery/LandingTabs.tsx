import { useLocation } from "react-router-dom";
import { Tab, Tabs } from "../common/styles";

const tabs = [
  {
    to: "/",
    children: "Home",
  },
  {
    to: "/apply-now",
    children: "Explore rounds",
  },
];

export default function LandingTabs() {
  const { pathname } = useLocation();

  return (
    <Tabs>
      {tabs.map((tab) => (
        <Tab key={tab.to} active={pathname === tab.to} {...tab} />
      ))}
    </Tabs>
  );
}
