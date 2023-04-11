import { Button } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { BaseModal } from "./BaseModal";

type ErrorModalProps = {
  open: boolean;
  children?: JSX.Element;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  onClose: (open: boolean) => void;
  onRetry: () => void;
  title?: string;
};

export default function ErrorModal({
  open,
  children,
  primaryBtnText,
  secondaryBtnText,
  onClose,
  onRetry,
  title,
}: ErrorModalProps): JSX.Element {
  return (
    <BaseModal isOpen={open} hideCloseButton onClose={() => onClose(false)}>
      <>
        <div className="flex flex-1 flex-row">
          <div>
            <InformationCircleIcon
              width={40}
              height={40}
              className="text-gitcoin-pink-500 bg-gitcoin-pink-100 p-2 rounded-full"
            />
          </div>
          <div className="ml-6 text-[16px] font-[600]">
            <div>{title ?? "Error"}</div>
            <p className="mt-2 text-[14px] font-[400]">
              {children ||
                "There has been a systems error during the deployment of your project."}
            </p>
          </div>
        </div>

        <div className="text-right mt-4">
          <Button
            className="mr-2 border bg-white px-8"
            onClick={() => {
              onRetry();
            }}
          >
            {secondaryBtnText || "Try Again"}
          </Button>
          <Button
            onClick={() => {
              onClose(false);
            }}
            className="bg-modal-button text-white ml-2 px-10"
          >
            {primaryBtnText || "Done"}
          </Button>
        </div>
      </>
    </BaseModal>
  );
}
