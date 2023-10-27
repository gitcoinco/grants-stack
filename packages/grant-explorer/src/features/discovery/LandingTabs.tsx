import { useLocation } from "react-router-dom";
import { Tab, Tabs } from "../common/styles";

type Tab = {
  to: string;
  children: string;
};
const tabs: Tab[] = [
  {
    to: "/",
    children: "Home",
  },
  {
    to: "/rounds",
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
