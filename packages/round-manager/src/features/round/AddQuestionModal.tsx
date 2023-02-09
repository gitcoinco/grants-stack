import { Dialog, Listbox } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { useState } from "react";

type AddQuestionModalProps = {
  show: boolean;
  onClose: () => void;
};

// type AddQeustionModalProps2 = Parameters<typeof AddQeustionModal>;

export enum QuestionType {
  SHORT_ANSWER = "SHORT_ANSWER",
  PARAGRAPH = "PARAGRAPH",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  CHECKBOXES = "CHECKBOXES",
  DROPDOWN = "DROPDOWN",
}

type Question = {
  id: string;
  text: string;
  type: QuestionType;
};

// test data for building out the questions
const questions: Question[] = [
  { id: "1", text: "Short answer", type: QuestionType.SHORT_ANSWER },
  { id: "2", text: "Paragraph", type: QuestionType.PARAGRAPH },
  { id: "3", text: "Mulitple Choice", type: QuestionType.MULTIPLE_CHOICE },
  { id: "4", text: "Checkboxes", type: QuestionType.CHECKBOXES },
  { id: "5", text: "Dropdown", type: QuestionType.DROPDOWN },
];

function renderQuestionType(questionType: QuestionType) {
  switch (questionType) {
    case QuestionType.SHORT_ANSWER:
      return "Short answer";
    case QuestionType.PARAGRAPH:
      return "Paragraph";
    case QuestionType.MULTIPLE_CHOICE:
      return "Multiple choice";
    case QuestionType.CHECKBOXES:
      return "Checkboxes";
    case QuestionType.DROPDOWN:
      return "Dropdown";
  }
}

function renderIcon() {
  return (
    <CheckIcon
      className="ui-active:text-white h-5 w-5 text-violet-400 flex justify-center align-middle mt-1 ui-not-active:text-grey-500"
      aria-hidden="true"
    />
  );
}

function QuestionSelectList() {
  const [selectedQueston, setSelectedQueston] = useState<Question>(questions[0]);

  return (
    <Listbox
      value={selectedQueston}
      name="question"
      onChange={(q: Question) => {
        if (!q) return;
        setSelectedQueston(q);
        renderQuestionType(q.type);
      }}
    >
      <Listbox.Button className="border rounded-[4px] border-gray-100 p-2 flex">
        <span className="mr-1 ml-3 text-grey-400 font-medium">Select a type</span>
        {/* todo: add chevron */}
        <ChevronDownIcon className="text-grey-400 h-5 w-5 ml-8" aria-hidden="true" />
      </Listbox.Button>
      <Listbox.Options className="border p-2 border-grey-100 w-[208px]">
        {questions.map(question => (
          <Listbox.Option
            key={question.id}
            value={question}
            className="flex ui-active:bg-violet-400 ui-active:text-white ui-not-active:bg-white ui-not-active:text-black"
          >
            {({ active, selected }) => (
              <span
                className={`flex ${active ? 'bg-violet-400 text-white' : 'bg-white text-black'
                  }`}
              >
                {selected && renderIcon()}
                <span className="flex text-[16px]">{question.text}</span>
              </span>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}

function AddQuestionModal({ show, onClose }: AddQuestionModalProps) {
  const [isOpen, setIsOpen] = useState(show);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-[628px] rounded bg-white p-10">
          <Dialog.Title className="mb-4">
            <span className="text-lg text-grey-500">Add Question</span>
          </Dialog.Title>
          <Dialog.Description className="mb-2 text-grey-500 font-normal">
            <span className="text-md ">Question Type</span>
          </Dialog.Description>
          <div>
            {/* todo: add type select here */}
            <QuestionSelectList />
          </div>
          <div className="mt-10 flex flex-row justify-end">
            {/* todo: style buttons */}
            <button
              className="border rounded-[4px] border-gray-100 p-3 mr-2 w-[140px]"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              className="border rounded-[4px] bg-violet-400 p-3 mr-6 w-[140px] text-white"
              onClick={() => setIsOpen(false)}
            >
              Add
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default AddQuestionModal;
