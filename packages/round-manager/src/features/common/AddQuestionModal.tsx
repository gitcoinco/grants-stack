import { Dialog, Listbox } from "@headlessui/react";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/solid";
import { Button } from "common/src/styles";
import { useState } from "react";
import { EditQuestion, InputType, QuestionOptions } from "../api/types";
import BaseSwitch from "./BaseSwitch";
import { InputIcon } from "./InputIcon";
import Option from "./Option";

type AddQuestionModalProps = {
  onSave: (question: EditQuestion) => void;
  question: EditQuestion | undefined;
  show: boolean;
  onClose: () => void;
};

// test data for building out the questions
const questions: InputType[] = [
  "short-answer",
  "email",
  "address",
  "paragraph",
  "multiple-choice",
  "checkbox",
  "dropdown",
]

// eslint-disable-next-line prefer-const
let options = [];

function AddQuestionModal({ onSave, question, show, onClose }: AddQuestionModalProps) {
  const questionExists = question && question !== undefined;

  const [isOpen, setIsOpen] = useState(show);
  const [optional, setOptional] = useState(questionExists && question.field?.required ? false : true);
  const [encrypted, setEncrypted] = useState(questionExists && question.field?.encrypted ? true : false);
  const [showExplorer, setShowExplorer] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState(questionExists && question.field?.inputType ? question.field.inputType : "Select a type");

  // toggles for the modal
  const optionalSwitch = () => {
    return <BaseSwitch activeLabel="*Required" inactiveLabel="Optional" value={optional} handler={b => setOptional(b)} />;
  }

  const encryptionToggle = () => {
    return <BaseSwitch activeLabel="Encrypted" inactiveLabel="Not Encrypted" value={encrypted} handler={setEncrypted} />;
  }

  const explorerToggle = () => {
    return <BaseSwitch activeLabel="Show in Explorer" inactiveLabel="Hide from Explorer" value={showExplorer} handler={setShowExplorer} />;
  }

  // renders the toggles in a group for ui
  const renderSwitches = () => {
    return (
      <div className="flex flex-row justify-between mt-6 w-[360px]">
        {optionalSwitch()}
        {encryptionToggle()}
        {explorerToggle()}
      </div>
    );
  }

  function AnswerArea({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <div className="flex flex-col mt-6">
          <hr className="mb-6" />
          <span className="mb-2">Question Title</span>
          {children}
        </div>
        {renderSwitches()}
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function ShortAnswer({ type }: { type: InputType }) {
    return (
      <input
        className="border border-grey-100 rounded-sm ui-active:border-violet-400"
        type="text"
        placeholder="Question"
      />
    );
  }

  function Paragraph() {
    return (
      <textarea className="border border-grey-100 rounded-sm ui-active:border-violet-400" placeholder="enter question title" />
    );
  }

  // todo: figure out where to put this
  const addOption = () => {
    console.log("add option");
    options.push({ id: options.length, text: "Option", parent: "checkbox" });
  };

  const AddOptionButton = () => {
    return (
      <Button
        onClick={addOption}
        className="border border-violet-100 bg-violet-100 py-[6px] px=2 w-[336px] rounded mt-2"
      >
        <span className="flex flex-row justify-center">
          <PlusIcon className="h-5 w-5 text-violet-400 font-medium align-middle mt-[1px]" />
          <span className="ml-2 text-violet-400 font-medium">Add Option</span>
        </span>
      </Button>
    );
  };

  function AddOptions() {
    return (
      <>
        <input
          type="text"
          className="flex border border-grey-100 rounded focus:border-violet-400 w-full"
          placeholder="Enter Question Title"
        />
        <div className="flex flex-col">
          <Option
            index={1}
            onAddOption={() => {
              // todo:
            }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onDeleteOption={(index: number) => {
              // todo:
            }}
          />
          <Option
            index={2}
            onAddOption={() => {
              // todo:
            }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onDeleteOption={(index: number) => {
              // todo:
            }}
          />
        </div>
        <AddOptionButton />
      </>
    );
  }

  function MultipleChoice() {
    return <AddOptions />;
  }

  function Checkboxes() {
    return <AddOptions />;
  }

  function Dropdown() {
    return <AddOptions />;
  }

  function typeToText(s: string) {
    return (s.charAt(0).toUpperCase() + s.slice(1)).replace("-", " ");
  }

  function QuestionSelectList() {
    // render the correct icon based on the question type

    return (
      <Listbox
        value={selectedQuestion}
        name="question"
        onChange={(q: InputType) => {
          console.log("q", q);
          setSelectedQuestion(q);
        }}
      >
        <Listbox.Button className="border rounded-[4px] border-gray-100 p-3 flex">
          <InputIcon className="mt-1" type={selectedQuestion} />
          <span className="mr-1 ml-2 text-grey-400 font-medium">{typeToText(selectedQuestion)}</span>
          <ChevronDownIcon className="text-grey-400 h-5 w-5 ml-8" aria-hidden="true" />
        </Listbox.Button>
        <Listbox.Options className="border p-2 border-grey-100 w-[208px]">
          {questions.map((q, index) => (
            <Listbox.Option
              key={index}
              value={q}
              className="flex active:bg-violet-400 active:text-white bg-white text-black"
            >
              {({ active }) => (
                <span
                  className={`flex ${active ? 'bg-violet-400 text-white' : 'bg-white text-black'
                    }`}
                >
                  <span className="w-5 h-5 mt-1 flex items-center text-grey-500 focus:text-violet-400">
                    <InputIcon type={q} />
                  </span>
                  <span className="flex text-md w-full ml-1 mt-0.5 ">{typeToText(q)}</span>
                </span>
              )}
            </Listbox.Option>)
          )}
        </Listbox.Options>
      </Listbox>
    )
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 max-w-[628px] max-h-[557px]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-[628px] rounded bg-white p-10">
          <Dialog.Title className="mb-4">
            <span className="text-lg text-grey-500">{questionExists ? `Edit Question` : `Add Question`}</span>
          </Dialog.Title>
          <Dialog.Description className="mb-2 text-grey-500 font-normal">
            <span className="text-md ">Question Type</span>
          </Dialog.Description>
          <hr className="my-6" />
          <div>
            <QuestionSelectList />
          </div>
          <div>
            {/* todo: get the display to work on selected question type */}
            <div className="flex flex-col mt-6">
              <AnswerArea>
                <>
                  {(() => {
                    switch (selectedQuestion) {
                      case "email":
                      case "address":
                      case "short-answer":
                        return <ShortAnswer type={selectedQuestion} />;
                      case "paragraph":
                        return <Paragraph />;
                      case "multiple-choice":
                        return <MultipleChoice />;
                      case "checkbox":
                        return <Checkboxes />;
                      case "dropdown":
                        return <Dropdown />;
                      default:
                        return null;
                    }
                  })()}
                </>
              </AnswerArea>
            </div>
          </div>
          <div className="mt-10 flex flex-row justify-end">
            <button
              className="border rounded-[4px] border-gray-100 p-3 mr-2 w-[140px]"
              onClick={() => {
                setIsOpen(false)
                onClose()
              }}
            >
              Cancel
            </button>
            <button
              className="border rounded-[4px] bg-violet-400 p-3 mr-6 w-[140px] text-white"
              onClick={() => {
                setIsOpen(false);
                // onSave();
              }}
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
