import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import { Metadata, Project } from "../../types";
import ToggleDetails from "./ToggleDetails";

export default function Toggle({
  projectMetadata,
  showProjectDetails,
}: {
  projectMetadata?: Metadata | Project;
  showProjectDetails: boolean;
}) {
  return (
    <div>
      {showProjectDetails && projectMetadata && (
        <Accordion className="w-2/3 mt-4" allowToggle>
          <AccordionItem className="border-none">
            <h2>
              <AccordionButton className="pl-0">
                <Box flex="1" textAlign="left" className="text-sm">
                  View your Project Details
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} pl={0}>
              <ToggleDetails project={projectMetadata} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
