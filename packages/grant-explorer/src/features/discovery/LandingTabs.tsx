import { useLocation } from "react-router-dom";
import { Tab, Tabs } from "../common/styles";
import { toQueryString } from "./RoundsFilter";
import { FilterStatus } from "./hooks/useFilterRounds";
import { useMediaQuery } from "@chakra-ui/react";

type Tab = {
  to: string;
  children: string;
  tabName: string;
};

export const exploreRoundsLink = `/rounds?${toQueryString({
  orderBy: "matchAmount",
  orderDirection: "desc",
  status: [FilterStatus.active, FilterStatus.taking_applications].join(","),
})}`;

export default function LandingTabs() {
  const { pathname } = useLocation();
  const [isDesktop] = useMediaQuery("(min-width: 768px)");

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
        status: [FilterStatus.active, FilterStatus.taking_applications].join(
          ","
        ),
      })}`,
      children: isDesktop ? "Explore rounds" : "Rounds",
      tabName: "home-rounds-tab",
    },
    {
      to: "/projects",
      children: isDesktop ? "Explore projects" : "Projects",
      tabName: "home-projects-tab",
    },
  ];

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
