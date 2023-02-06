import { Fragment, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Cross from "../icons/Cross";
import colors from "../../styles/colors";

export default function Toast({
  children,
  show,
  error = false,
  fadeOut = false,
  onClose,
}: {
  children: JSX.Element;
  show: boolean;
  error?: boolean;
  fadeOut?: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [fadeOut]);

  return (
    <div
      aria-live="assertive"
      className="fixed inset-x-0 bottom-0 flex items-center px-4 py-6 sm:p-6"
    >
      <div className="w-full flex flex-col items-center space-y-4">
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`p-3 shadow-lg rounded flex ${
              error ? "bg-danger-text" : "bg-secondary-background"
            }`}
          >
            <div className="flex items-start">{children}</div>
            <button type="button" onClick={onClose} className="inline-flex">
              <Cross color={colors["quaternary-text"]} />
            </button>
          </div>
        </Transition>
      </div>
    </div>
  );
}
