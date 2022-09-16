import {
  Accordion,
  AccordionItem,
  AccordionButton,
  Box,
  AccordionPanel,
} from "@chakra-ui/react";
import { Metadata, FormInputs, Project } from "../../types";
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
                <Box flex="1" textAlign="left">
                  Project Details
                </Box>
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
