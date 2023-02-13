import { Dialog } from "@headlessui/react";
import { useState } from "react";

function PreviewQuestionModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(show);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 max-w-[628px] max-h-[557px]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-[628px] rounded bg-white p-10">
          <Dialog.Title className="mb-4">
            <span className="text-lg text-grey-500">Preview Additional Questions</span>
          </Dialog.Title>
          <div>
            {/* todo: show the added questions */}
            <div className="flex flex-col mt-6">
            </div>
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
  )
}

export default PreviewQuestionModal;
