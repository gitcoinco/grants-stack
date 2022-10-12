import { Button, Grid, GridItem } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { BaseModal } from "./BaseModal";

type ErrorModalProps = {
  open: boolean;
  onClose: (open: boolean) => void;
};

export default function ErrorModal({
  open,
  onClose,
}: ErrorModalProps): JSX.Element {
  return (
    <BaseModal
      isOpen={open}
      hideCloseButton={false}
      onClose={() => onClose(false)}
    >
      <div>
        <Grid
          h="40px"
          templateRows="repeat(2, 1fr)"
          templateColumns="repeat(10, 1fr)"
        >
          <GridItem className="">
            <InformationCircleIcon
              width={24}
              height={24}
              className="text-gitcoin-pink-500 bg-gitcoin-pink-100 p-2 rounded-full"
            />
          </GridItem>
          <GridItem className="ml-2 text-left text-[16px] font-[600]">
            Error
          </GridItem>
        </Grid>
        <div className="ml-12 m-2">
          <p className="mb-10 text-[14px] font-[400]">
            There has been a systems error while applyting to this round. Please
            close this modal and try again.
          </p>
        </div>
        <div className="m-2 text-right">
          <Button className="mr-2 px-4">Try Again</Button>
          <Button
            onClick={() => onClose(false)}
            className="bg-gitcoin-violet-400 text-white ml-2 px-10"
          >
            Done
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
