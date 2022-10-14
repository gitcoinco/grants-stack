import { Button, Grid, GridItem } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { BaseModal } from "./BaseModal";

type ErrorModalProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  onRetry: () => void;
};

export default function ErrorModal({
  open,
  onClose,
  onRetry,
}: ErrorModalProps): JSX.Element {
  return (
    <BaseModal isOpen={open} hideCloseButton onClose={() => onClose(false)}>
      <div>
        <Grid
          h="195px"
          templateRows="repeat(3, 1fr)"
          templateColumns="repeat(10, 1fr)"
        >
          <GridItem className="">
            <InformationCircleIcon
              width={40}
              height={40}
              className="text-gitcoin-pink-500 bg-gitcoin-pink-100 p-2 rounded-full"
            />
          </GridItem>
          <GridItem
            colStart={2}
            colSpan={8}
            className="ml-4 text-left text-[16px] font-[600]"
          >
            <span>Error</span>
            <p className="mt-10 text-[14px] font-[400]">
              There has been a systems error during the deployment of your
              project.
            </p>
          </GridItem>
          <GridItem rowStart={3} colSpan={10}>
            <div className="text-right">
              <Button
                className="mr-2 px-4"
                onClick={() => {
                  onRetry();
                }}
              >
                Try Again
              </Button>
              <Button
                onClick={() => {
                  onClose(false);
                }}
                className="bg-gitcoin-violet-400 text-white ml-2 px-10"
              >
                Done
              </Button>
            </div>
          </GridItem>
        </Grid>
      </div>
    </BaseModal>
  );
}
