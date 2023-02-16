/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/solid";
import { Button } from "common/src/styles";
import { Fragment, useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EditQuestion, InputType, QuestionOption } from "../api/types";
import BaseSwitch from "./BaseSwitch";
import { InputIcon } from "./InputIcon";
import Option from "./Option";

const INITIAL_VALUE = "Select a type";

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

// eslint-disable-next-line
let options: QuestionOption[] = [];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AddQuestionModal({ onSave, question, show, onClose }: AddQuestionModalProps) {
  const questionExists = question && question.index !== undefined;

  const [isOpen, setIsOpen] = useState(show);
  const initialQuestion = question;
  const [questionOptions, setQuestionOptions] = useState<QuestionOption>({
    title: "",
    required: false,
    encrypted: false,
    hidden: false,
    inputType: "short-answer",
    options: [],
  });

  const [selectedQuestion, setSelectedQuestion] = useState("");

  useEffect(() => {
    if (question && question.index !== undefined && question.field?.inputType) {
      setSelectedQuestion(question.field.inputType);
      setQuestionOptions(question.field);
    } else {
      setSelectedQuestion(INITIAL_VALUE);
    }
  }, [question]);

  // renders the toggles in a group for ui
  const renderSwitches = () => {

    const switches = [
      {
        activeLabel: "*Required",
        inactiveLabel: "Optional",
        value: "required"
      },
      {
        activeLabel: "Encrypted",
        inactiveLabel: "Not Encrypted",
        value: "encrypted"
      },
      {
        activeLabel: "Show in Explorer",
        inactiveLabel: "Hide from Explorer",
        value: "hidden"
      }
    ]

    return (
      <div className="flex flex-row justify-between mt-6 w-[80%]">
        {switches.map(s => (
          <BaseSwitch
            key={s.value}
            activeLabel={s.activeLabel}
            inactiveLabel={s.inactiveLabel}
            value={Boolean(questionOptions[s.value as keyof QuestionOption]) || false}
            handler={(b: boolean) =>
              setQuestionOptions({ ...questionOptions, [s.value]: b })
            }
          />
        ))}
      </div>
    );
  }

  function answerArea(inner: JSX.Element) {
    return (
      <div>
        <div className="flex flex-col mt-6">
          <hr className="mb-6" />
          <span className="mb-2">Question Title</span>
          <input
            className="border border-grey-100 rounded-sm ui-active:border-violet-400"
            key="question-title"
            type="text"
            placeholder="Question"
            value={questionOptions.title}
            onChange={(e) =>
              setQuestionOptions({
                ...questionOptions,
                title: e.target.value,
              })
            }
          />
          {inner}
        </div>
        {renderSwitches()}
      </div>
    );
  }

  const AddOptionButton = () => {
    return (
      <Button
        role="add-option"
        onClick={() => {
          const renderOptions = questionOptions.options || [];
          renderOptions.push("");
          setQuestionOptions({
            ...questionOptions,
            options: renderOptions,
          });
        }}
        className="border border-violet-100 bg-violet-100 py-[6px] px=2 w-[336px] rounded mt-2"
      >
        <span className="flex flex-row justify-center">
          <PlusIcon className="h-5 w-5 text-violet-400 font-medium align-middle mt-[1px]" />
          <span className="ml-2 text-violet-400 font-medium">Add Option</span>
        </span>
      </Button>
    );
  };

  function addOptions() {

    const renderOptions = questionOptions.options || [];

    if (renderOptions.length === 0) {
      renderOptions.push("");

      setQuestionOptions({
        ...questionOptions,
        options: renderOptions,
      })
    }

    const render: JSX.Element[] = [];

    for (let i = 0; i < renderOptions.length; i++) {
      render.push(
        <div role="option" key={i + 1} className="flex flex-col">
          <Option
            index={i + 1}
            value={questionOptions.options?.[i] || ""}
            onChange={(event: any) => {
              event.preventDefault();
              if (questionOptions.options?.length)
                setQuestionOptions({
                  ...questionOptions,
                  options: [
                    ...questionOptions.options.slice(0, i),
                    event.target.value,
                    ...questionOptions.options.slice(i + 1),
                  ]
                })
            }
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onDeleteOption={() => {
              if (questionOptions.options?.length)
                setQuestionOptions({
                  ...questionOptions,
                  options: [
                    ...questionOptions.options.slice(0, i),
                    ...questionOptions.options.slice(i + 1),
                  ]
                })
            }}
            options={[questionOptions]}
          />
        </div>
      );
    }

    return (
      <>
        {render}
        <AddOptionButton />
      </>
    );
  }

  function typeToText(s: string) {
    return (s.charAt(0).toUpperCase() + s.slice(1)).replace("-", " ");
  }

  function QuestionSelectList() {
    return (
      <div role="select-list" className="w-[208px]">
        <Listbox
          value={selectedQuestion}
          name="question"
          onChange={(q: InputType) => {
            console.log("q", q);
            setSelectedQuestion(q);
            setQuestionOptions({
              ...questionOptions,
              inputType: q,
            });
          }}
        >
          <div className="relative mt-1">
            <Listbox.Button className="border rounded-[4px] border-gray-100 p-3 flex relative">
              <InputIcon className="mt-1" type={selectedQuestion} />
              <span className="mr-1 ml-2 text-grey-400 font-medium">{typeToText(selectedQuestion)}</span>
              <ChevronDownIcon className="text-grey-400 h-5 w-5 ml-8" aria-hidden="true" />
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="border p-2 border-grey-100 w-[208px] overflow-auto">
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
            </Transition>
          </div>
        </Listbox>
      </div>
    )
  }

  return (
    <div data-testid="add-question-modal">
      <Dialog open={isOpen} onClose={onClose} className="relative z-50 max-w-[628px] max-h-[557px]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-[628px] rounded bg-white p-10">
            <Dialog.Title className="mb-4">
              <span className="text-lg text-grey-500">{questionExists ? `Edit Question` : `Add Question`}</span>
            </Dialog.Title>
            <Dialog.Description className="mb-2 text-grey-500 font-normal">
              <span className="text-md">Question Type</span>
            </Dialog.Description>
            <hr className="my-6" />
            <div>
              <QuestionSelectList />
            </div>
            <div>
              <div className="flex flex-col mt-6">
                {selectedQuestion !== INITIAL_VALUE &&
                  answerArea((selectedQuestion == "multiple-choice"
                    || selectedQuestion == "checkbox"
                    || selectedQuestion == "dropdown") ? addOptions() : <></>)
                }
              </div>
            </div>
            <div className="mt-10 flex flex-row justify-end">
              <button
                role="cancel"
                className="border rounded-[4px] border-gray-100 p-3 mr-2 w-[140px]"
                onClick={() => {
                  setIsOpen(false)
                  onClose()
                }}
              >
                Cancel
              </button>
              <button
                role="save"
                className="border rounded-[4px] bg-violet-400 p-3 mr-6 w-[140px] text-white"
                onClick={() => {
                  setIsOpen(false);
                  onSave({
                    ...initialQuestion,
                    field: {
                      ...questionOptions
                    }
                  })
                }}
              >
                {questionExists ? `Save` : `Add`}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default AddQuestionModal;
