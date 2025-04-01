import { ComponentPropsWithRef, FunctionComponent, createElement } from "react";

import { Box, Tab, Tabs } from "@chakra-ui/react";

type Tab = {
  name: string;
  icon?: FunctionComponent<ComponentPropsWithRef<"svg">>;
  content: JSX.Element;
};

export function RoundTabs(props: {
  tabs: Tab[];
  onChange?: (tabIndex: number) => void;
  selected: number;
}) {
  return (
    <Box className="font-modern-era-medium" bottom={0.5}>
      {props.tabs.length > 0 && (
        <Tabs
          display="flex"
          gap={8}
          defaultIndex={props.selected}
          onChange={props.onChange}
        >
          {props.tabs.map((tab, index) => (
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
          ))}
        </Tabs>
      )}
    </Box>
  );
}
