import { Dialog, Listbox, Switch } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "@heroicons/react/solid";
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
  NA = "NA",
}

type Question = {
  id: string;
  text: string;
  type: QuestionType;
};

// test data for building out the questions
const questions: Question[] = [
  { id: "0", text: "Select a type", type: QuestionType.NA },
  { id: "1", text: "Short answer", type: QuestionType.SHORT_ANSWER },
  { id: "2", text: "Paragraph", type: QuestionType.PARAGRAPH },
  { id: "3", text: "Mulitple Choice", type: QuestionType.MULTIPLE_CHOICE },
  { id: "4", text: "Checkboxes", type: QuestionType.CHECKBOXES },
  { id: "5", text: "Dropdown", type: QuestionType.DROPDOWN },
];

function AddQuestionModal({ show, onClose }: AddQuestionModalProps) {
  const [isOpen, setIsOpen] = useState(show);
  const [optional, setOptional] = useState(false);
  const [encrypted, setEncrypted] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);

  const optionalSwitch = () => {
    return (
      <Switch.Group>
        <div className="flex items-center mt-7">
          <span className="">
            <Switch.Label
              as="span"
              className="text-sm font-medium text-gray-900"
              passive
            >
              {optional ? (
                <p className="text-xs mr-2 text-right text-violet-400">
                  *Required
                </p>
              ) : (
                <p className="text-xs mr-2 text-right">Optional</p>
              )}
            </Switch.Label>
          </span>
          <Switch
            checked={optional}
            onChange={setOptional}
            className={`${optional ? 'bg-violet-400' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2`}
          >
            <span
              className={`${optional ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </Switch.Group>
    );
  }

  const encryptionToggle = () => {
    return (
      <Switch.Group>
        <div className="flex items-center mt-7">
          <span className="">
            <Switch.Label
              as="span"
              className="text-sm font-medium text-gray-900"
              passive
            >
              {encrypted ? (
                <p className="text-xs mr-2 text-right text-violet-400">
                  Not Encrypted
                </p>
              ) : (
                <p className="text-xs mr-2 text-right">Encrypted</p>
              )}
            </Switch.Label>
          </span>
          <Switch
            checked={encrypted}
            onChange={setEncrypted}
            className={`${encrypted ? 'bg-violet-400' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2`}
          >
            <span
              className={`${encrypted ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </Switch.Group>
    );
  }

  const explorerToggle = () => {
    return (
      <Switch.Group>
        <div className="flex items-center mt-7">
          <span className="">
            <Switch.Label
              as="span"
              className="text-sm font-medium text-gray-900"
              passive
            >
              {showExplorer ? (
                <p className="text-xs mr-2 text-right text-violet-400">
                  Hidden From Explorer
                </p>
              ) : (
                <p className="text-xs mr-2 text-right">Shown in Explorer</p>
              )}
            </Switch.Label>
          </span>
          <Switch
            checked={showExplorer}
            onChange={setShowExplorer}
            className={`${showExplorer ? 'bg-violet-400' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2`}
          >
            <span
              className={`${showExplorer ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </Switch.Group>
    );
  }

  const renderSwitches = () => {
    return (
      <div className="flex flex-row justify-between mt-6">
        {optionalSwitch()}
        {encryptionToggle()}
        {explorerToggle()}
      </div>
    );
  }

  function ShortAnswer() {
    return (
      <div>
        <div className="flex flex-col mt-6">
          <hr className="mb-6" />
          <span className="mb-2">Question Title</span>
          <input
            className="borderborder-grey-100 rounded-sm ui-active:border-violet-400"
            type="text"
            placeholder="Question"
          />
        </div>
        {renderSwitches()}
      </div>

    );
  }

  function Paragraph() {
    return (
      <div>
        <div className="flex flex-col mt-6">
          <hr className="mb-6" />
          <span className="mb-2">Question Text</span>
          <textarea className="border border-grey-100 rounded-sm ui-active:border-violet-400" placeholder="enter question text" />
        </div>
        {renderSwitches()}
      </div>
    );
  }

  function MultipleChoice() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const deleteQuestionClick = (index: number) => {
      // todo: delete question
    };

    const renderDeleteQueston = (index: number) => {
      return (
        <button onClick={() => deleteQuestionClick(index)}>
          <XIcon className="h-5 w-5 text-[#D03E63] ml-6" aria-hidden="true" />
        </button>
      )
    };

    const option = (index: number) => {
      return (
        <div className="flex flex-row mt-2">
          <span className="flex mt-2 ml-5 mr-[22px]">Option {index}</span>
          <input
            className="border border-grey-100 rounded-sm ui-active:bg-violet-400 w-72"
            type="text"
            placeholder="Answer Option"
          />
          {renderDeleteQueston(index)}
        </div>
      );
    };

    return (
      <div className="flex flex-col">
        <span className="mb-2">Question Title</span>
        <div className="border-l pl-2">
          <div className="flex flex-row mt-2">
            <input
              type="text"
              className="border border-grey-100 rounded-sm ui-active:border-violet-400 w-full"
              placeholder="enter question text"
            />
          </div>
          <div className="flex flex-col">
            {/* todo: */}
            {option(1)}
            {option(2)}
            {option(3)}
          </div>
          <button className="border border-violet-100 bg-violet-100 py-[6px] px=2 w-[336px] rounded mt-2">
            <span className="flex flex-row justify-center">
              <PlusIcon className="h-5 w-5 text-violet-400 font-medium align-middle mt-[1px]" />
              <span className="ml-2 text-violet-400 font-medium">Add Option</span>
            </span>
          </button>
        </div>
        {renderSwitches()}
      </div>
    );
  }

  function Checkboxes() {
    return (
      <div className="flex flex-col mt-6">
        <hr className="mb-6" />
        <span className="mb-2">Question Text</span>
        <input
          type="text"
          className="border border-grey-100 rounded-sm ui-active:border-violet-400"
          placeholder="enter question text"
        />
        <span className="mb-2 mt-6">Answer Options</span>
        <div className="flex flex-col">
          <input
            className="border border-grey-100 rounded-sm ui-active:bg-violet-400"
            type="checkbox"
            placeholder="Answer Option"
          />
          <input
            className="border border-grey-100 rounded-sm ui-active:bg-violet-400"
            type="checkbox"
            placeholder="Answer Option"
          />
          <input
            className="border border-grey-100 rounded-sm ui-active:bg-violet-400"
            type="checkbox"
            placeholder="Answer Option"
          />
        </div>
      </div>
    );
  }

  function Dropdown() {
    return (
      <div className="flex flex-col mt-6">
        <hr className="mb-6" />
        <span className="mb-2">Question Text</span>
        <textarea className="border border-grey-100 rounded-sm ui-active:border-violet-400" placeholder="enter question text" />
        <span className="mb-2 mt-6">Answer Options</span>
        <div className="flex flex-col">
          <input
            className="border border-grey-100 rounded-sm ui-active:border-violet-400"
            type="text"
            placeholder="Answer Option"
          />
          <input
            className="border border-grey-100 rounded-sm ui-active:border-violet-400"
            type="text"
            placeholder="Answer Option"
          />
          <input
            className="border border-grey-100 rounded-sm ui-active:border-violet-400"
            type="text"
            placeholder="Answer Option"
          />
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let questionDisplay: JSX.Element;
  function QuestionSelectList() {
    const [selectedQueston, setSelectedQueston] = useState<Question>(questions[0]);

    function renderQuestionType(questionType: QuestionType) {
      switch (questionType) {
        case QuestionType.SHORT_ANSWER:
          questionDisplay = <ShortAnswer />;
          break;
        case QuestionType.PARAGRAPH:
          questionDisplay = <Paragraph />;
          break;
        case QuestionType.MULTIPLE_CHOICE:
          questionDisplay = <MultipleChoice />;
          break;
        case QuestionType.CHECKBOXES:
          questionDisplay = <Checkboxes />;
          break;
        case QuestionType.DROPDOWN:
          questionDisplay = <Dropdown />;
          break;
        case QuestionType.NA:
          return <></>;
      }
    }

    // todo: render the correct icon based on the question type
    function renderIcon() {
      return (
        <CheckIcon
          className="ui-active:text-white h-5 w-5 text-violet-400 flex justify-center align-middle mt-1 ui-not-active:text-grey-500"
          aria-hidden="true"
        />
      );
    }

    return (
      <Listbox
        value={selectedQueston}
        name="question"
        onChange={(q: Question) => {
          console.log("q", q);
          setSelectedQueston(q);
          renderQuestionType(q.type);
        }}
      >
        <Listbox.Button className="border rounded-[4px] border-gray-100 p-2 flex">
          <span className="mr-1 ml-3 text-grey-400 font-medium">{selectedQueston.text}</span>
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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 max-w-[628px] max-h-[557px]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-[628px] rounded bg-white p-10">
          <Dialog.Title className="mb-4">
            <span className="text-lg text-grey-500">Add Question</span>
          </Dialog.Title>
          <Dialog.Description className="mb-2 text-grey-500 font-normal">
            <span className="text-md ">Question Type</span>
            <hr className="my-6" />
          </Dialog.Description>
          <div>
            <QuestionSelectList />
          </div>
          <div>
            {/* todo: get the display to work */}
            <div className="flex flex-col mt-6">
              {/* <ShortAnswer />
              <Paragraph /> */}
              <MultipleChoice />
              {/* <Checkboxes />
              <Dropdown /> */}
            </div>
          </div>
          <div className="mt-10 flex flex-row justify-end">
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
