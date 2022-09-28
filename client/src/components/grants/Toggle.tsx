import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import { FormInputs, Metadata, Project } from "../../types";
import ToggleDetails from "./ToggleDetails";

export default function Toggle({
  projectMetadata,
  showProjectDetails,
}: {
  projectMetadata?: Metadata | FormInputs | Project;
  showProjectDetails: boolean;
}) {
  return (
    <div>
      {showProjectDetails && projectMetadata && (
        <Accordion className="w-1/2 mt-4" allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" className="text-sm">
                  Project Details
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <ToggleDetails project={projectMetadata} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
