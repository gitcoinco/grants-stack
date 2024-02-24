import { useLocation } from "react-router-dom";
import { Tab, Tabs } from "../common/styles";
import { toQueryString } from "./RoundsFilter";
import { RoundStatus } from "./hooks/useFilterRounds";
import { useMediaQuery } from "@chakra-ui/react";

type TabType = {
  to: string;
  children: string;
  tabName: string;
};

export const exploreRoundsLink = `/rounds?${toQueryString({
  orderBy: "MATCH_AMOUNT_IN_USD_DESC",
  status: [RoundStatus.active, RoundStatus.taking_applications].join(","),
})}`;

export default function LandingTabs() {
  const { pathname } = useLocation();
  const [isDesktop] = useMediaQuery("(min-width: 768px)");

  const tabs: TabType[] = [
    {
      to: "/",
      children: "Home",
      tabName: "home-tab",
    },
    {
      to: `/rounds?${toQueryString({
        orderBy: "MATCH_AMOUNT_IN_USD_DESC",
        status: [RoundStatus.active, RoundStatus.taking_applications].join(","),
      })}`,
      children: isDesktop ? "Explore rounds" : "Rounds",
      tabName: "home-rounds-tab",
    },
  ];

  return (
    <Tabs>
      {tabs.map((tab) => {
        const match = tab.to.split("?")[0];
        const isActive = pathname === match;
        // Set the data-track-event attribute when the tab is active
        const tabProps = isActive ? { "data-track-event": tab.tabName } : {};

        return (
          <Tab key={tab.to} to={tab.to} active={isActive} {...tabProps}>
            {tab.children}
          </Tab>
        );
      })}
    </Tabs>
  );
}
