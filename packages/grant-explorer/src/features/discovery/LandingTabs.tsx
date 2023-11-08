import { useLocation } from "react-router-dom";
import { Tab, Tabs } from "../common/styles";
import { FilterStatus } from "./FilterDropdown";
import { toQueryString } from "./RoundsFilter";

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
