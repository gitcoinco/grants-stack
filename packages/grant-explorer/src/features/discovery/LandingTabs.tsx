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
    to: "/rounds?orderBy=matchAmount&orderDirection=desc",
    children: "Explore rounds",
  },
  {
    to: "/projects",
    children: "Projects",
  },
];

export default function LandingTabs() {
  const { pathname } = useLocation();
  return (
    <Tabs>
      {tabs.map((tab) => {
        const match = tab.to.split("?")[0];
        return <Tab key={tab.to} active={pathname === match} {...tab} />;
      })}
    </Tabs>
  );
}
