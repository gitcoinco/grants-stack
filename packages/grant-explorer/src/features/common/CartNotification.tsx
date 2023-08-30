import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { CheckIcon, EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "common/src/styles";
import { Project } from "../api/types";
import DefaultLogoImage from "../../assets/default_logo.png";
import { renderToPlainText } from "common";

export default function CartNotification(props: {
  showCartNotification: boolean;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
  currentProjectAddedToCart: Project;
}) {
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed top-12 inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={props.showCartNotification}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="flex mb-4 pb-2 gap-2 text-sm">
                      <CheckIcon className="w-4" />
                      Project added to your cart
                    </p>
                    <button
                      className="text-gray-400 hover:text-gray-500 pb-6"
                      onClick={() => props.setShowCartNotification(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <ProjectView project={props.currentProjectAddedToCart} />

                  <Button
                    type="button"
                    $variant="solid"
                    className="px-3 bg-violet-400 text-white border-0 text-xs mb-2"
                    onClick={() => {
                      const url = "#/cart";
                      window.open(url, "_blank");
                    }}
                  >
                    View my cart
                  </Button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}

export function ProjectView(props: { project: Project }) {
  return (
    <div className="flex mb-4" data-testid="project-quick-view">
      <div className="relative overflow-hidden bg-no-repeat bg-cover  min-w-[64px] w-16 max-h-[64px] mt-auto mb-auto">
        <img
          className="inline-block"
          src={
            props.project.projectMetadata.logoImg
              ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.project.projectMetadata.logoImg}`
              : DefaultLogoImage
          }
          alt={"Project Logo"}
        />
        <div className="min-w-[64px] w-16 max-h-[64px] absolute top-0 right-0 bottom-0 left-0 overflow-hidden bg-fixed opacity-0 hover:opacity-70 transition duration-300 ease-in-out bg-gray-500 justify-center flex items-center">
          <EyeIcon
            className="fill-gray-200 w-6 h-6 cursor-pointer"
            data-testid={`${props.project.projectRegistryId}-project-link`}
          />
        </div>
      </div>

      <div className="pl-4 mt-1">
        <p className="font-semibold mb-2 text-sm text-ellipsis line-clamp-1">
          {props.project.projectMetadata.title}
        </p>
        <p className="text-xs text-ellipsis line-clamp-3">
          {renderToPlainText(
            props.project.projectMetadata.description
          ).substring(0, 20)}
        </p>
      </div>
    </div>
  );
}
