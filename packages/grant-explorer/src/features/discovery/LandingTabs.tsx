import { useLocation } from "react-router-dom";
import { Tab, Tabs } from "../common/styles";
import { toQueryString } from "./RoundsFilter";
import { FilterStatus } from "./hooks/useFilterRounds";

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
    to: `/rounds?${toQueryString({
      orderBy: "matchAmount",
      orderDirection: "desc",
      status: [FilterStatus.active, FilterStatus.taking_applications].join(","),
    })}`,
    children: "Explore rounds",
  },
  {
    to: "/projects",
    children: "Explore projects",
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
