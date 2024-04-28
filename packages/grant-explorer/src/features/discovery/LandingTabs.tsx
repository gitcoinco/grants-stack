import { useLocation } from "react-router-dom";
import { Tab, Tabs } from "../common/styles";
import { toQueryString } from "./RoundsFilter";
import { RoundStatus } from "./hooks/useFilterRounds";
import { useMediaQuery } from "@chakra-ui/react";
import {
  useAlloVersion,
} from "common/src/components/AlloVersionSwitcher";

type TabType = {
  to: string;
  activeRegExp: RegExp;
  showRegExp?: RegExp;
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
      activeRegExp: /^\/$/,
      children: "Home",
      tabName: "home-tab",
    },
    {
      to: `/rounds?${toQueryString({
        orderBy: "MATCH_AMOUNT_IN_USD_DESC",
        status: [RoundStatus.active, RoundStatus.taking_applications].join(","),
      })}`,
      activeRegExp: /^\/rounds/,
      children: isDesktop ? "Explore rounds" : "Rounds",
      tabName: "home-rounds-tab",
    },
    {
      to: "/projects",
      activeRegExp: /^\/projects/,
      children: isDesktop ? "Explore projects" : "Projects",
      tabName: "home-projects-tab",
    },
  ];

  const { version: currentVersion } = useAlloVersion();
  if (currentVersion === "allo-v1") {
    // Remove the projects tab if the current version is allo-v1
    tabs.pop();
  }

  return (
    <Tabs className="font-mono">
      {tabs.map((tab, i) => {
        const isActive = tab.activeRegExp.test(pathname);
        // Set the data-track-event attribute when the tab is active
        const tabProps = isActive ? { "data-track-event": tab.tabName } : {};

        return (
          <Tab
            key={i}
            to={tab.to}
            active={isActive}
            show={
              tab.showRegExp === undefined
                ? true
                : tab.showRegExp.test(pathname)
            }
            {...tabProps}
          >
            {tab.children}
          </Tab>
        );
      })}
    </Tabs>
  );
}
