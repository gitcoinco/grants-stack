import { Grid } from "@chakra-ui/react";
import React from "react";

interface ExpandableGridProps {
  isOpen: boolean;
  classNames?: string;
  children: React.ReactNode;
}

export const ExpandableGrid: React.FC<ExpandableGridProps> = ({
  isOpen,
  classNames,
  children,
}) => {
  return (
    <Grid
      className={classNames}
      gridTemplateRows={isOpen ? "1fr" : "0fr"}
      transition="grid-template-rows 300ms"
    >
      {children}
    </Grid>
  );
};
