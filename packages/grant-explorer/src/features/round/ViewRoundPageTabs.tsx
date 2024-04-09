import { Box, Tab, Tabs } from "@chakra-ui/react";
import { PresentationChartBarIcon } from "@heroicons/react/24/outline";
import {
  ComponentPropsWithRef,
  FunctionComponent,
  createElement,
  useMemo,
} from "react";
import { Link, To, useLocation } from "react-router-dom";
import { Round } from "../api/types";
import { ChainId } from "common";
import { isDirectRound } from "../api/utils";

export default function ViewRoundPageTabs({
  round,
  roundId,
  chainId,
  isBeforeRoundEndDate,
  projectsCount,
}: {
  round: Round;
  chainId: ChainId;
  roundId: string;
  isBeforeRoundEndDate?: boolean;
  projectsCount: number;
}) {
  const { pathname } = useLocation();

  const projectDetailsTabs = useMemo(() => {
    const projectsTab = {
      name: isDirectRound(round)
        ? "Approved Projects"
        : `All Projects (${projectsCount})`,
      to: `/round/${chainId}/${roundId}`,
    };
    const statsTab = {
      name: isBeforeRoundEndDate ? "Stats" : "Results",
      to: `/round/${chainId}/${roundId}/stats`,
      icon: PresentationChartBarIcon,
    };

    const roundPageTabs = !isBeforeRoundEndDate
      ? [statsTab, projectsTab]
      : [projectsTab, statsTab];

    const selectedTabIndex = Number(
      (isBeforeRoundEndDate && projectsTab.to !== pathname) ||
        (!isBeforeRoundEndDate && statsTab.to !== pathname)
    );

    return { tabs: roundPageTabs, defaultSelectedIndex: selectedTabIndex };
  }, [chainId, projectsCount, round, roundId, isBeforeRoundEndDate, pathname]);

  return <RoundTabs tabs={projectDetailsTabs} />;
}

type Tab = {
  name: string;
  icon?: FunctionComponent<ComponentPropsWithRef<"svg">>;
  to: To;
};
function RoundTabs(props: {
  tabs: { tabs: Tab[]; defaultSelectedIndex: number };
}) {
  return (
    <Box className="font-modern-era-medium" bottom={0.5}>
      {props.tabs.tabs.length > 0 && (
        <Tabs display="flex" gap={8} defaultIndex={props.tabs.defaultSelectedIndex}>
          {props.tabs.tabs.map((tab, index) => (
            <Link to={tab.to} key={tab.name}>
              <Tab
                color={"blackAlpha.600"}
                fontSize={"lg"}
                key={index}
                className="flex items-center gap-2"
                _selected={{ color: "black", borderBottom: "3px solid black" }}
              >
                {tab.icon && (
                  <div>
                    {createElement(tab.icon, {
                      className: "w-4 h-4",
                    })}
                  </div>
                )}
                {tab.name}
              </Tab>
            </Link>
          ))}
        </Tabs>
      )}
    </Box>
  );
}
