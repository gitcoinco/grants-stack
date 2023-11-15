import { useLocation } from "react-router-dom";
import { Tab, Tabs } from "../common/styles";
import { toQueryString } from "./RoundsFilter";
import { FilterStatus } from "./hooks/useFilterRounds";

type Tab = {
  to: string;
  children: string;
  tabName: string;
};
const tabs: Tab[] = [
  {
    to: "/",
    children: "Home",
    tabName: "home-tab",
  },
  {
    to: `/rounds?${toQueryString({
      orderBy: "matchAmount",
      orderDirection: "desc",
      status: [FilterStatus.active, FilterStatus.taking_applications].join(","),
    })}`,
    children: "Explore rounds",
    tabName: "home-rounds-tab",
  },
  {
    to: "/projects",
    children: "Explore projects",
    tabName: "home-projects-tab",
  },
];

export default function LandingTabs() {
  const { pathname } = useLocation();
  return (
    <Tabs>
      {tabs.map((tab) => {
        const match = tab.to.split("?")[0];
        const isActive = pathname === match;
        // Set the data-track-event attribute when the tab is active
        const tabProps = isActive ? { "data-track-event": tab.tabName } : {};

        return <Tab key={tab.to} active={isActive} {...tab} {...tabProps} />;
      })}
    </Tabs>
  );
}
