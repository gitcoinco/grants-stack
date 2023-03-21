import { Dialog } from "@headlessui/react";
import { Input } from "common/src/styles";
import { useState } from "react";

function PreviewQuestionModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(show);

  const renderQuestionList = () => {
    return (
      <div className="flex flex-col mb-2">
        <div className="flex flex-row justify-between">
          <span className="flex">ToDo: Question List Here</span>
        </div>
        <div className="flex flex-row justify-between mt-2">
          <span className="flex text-xs text-grey-400">
            This info will be shown in Explorer.
          </span>
          <span className="text-xs text-violet-400">*Required</span>
        </div>
        <div className="flex flex-row justify-between mt-2">
          <Input
            className="border rounded-sm border-grey-100 p-2"
            disabled
            value="testing the value"
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50 max-w-[628px] max-h-[557px]"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-[628px] rounded bg-white p-10">
          <Dialog.Title className="mb-4">
            <span className="text-lg text-grey-500">
              Preview Additional Questions
            </span>
          </Dialog.Title>
          <div className="border border-grey-100 rounded-sm p-4">
            {renderQuestionList()}
          </div>
          <div className="mt-10 flex flex-row justify-end">
            <button
              className="border rounded-[4px] border-gray-100 p-3 mr-2 w-[140px]"
              onClick={() => setIsOpen(false)}
            >
              Close Preview
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default PreviewQuestionModal;
