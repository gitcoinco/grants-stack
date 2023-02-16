/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon, PlusIcon, XCircleIcon } from "@heroicons/react/solid";
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
    type: "short-answer",
    options: [],
  });

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [inputError, setInputError] = useState<string[]>([]);

  useEffect(() => {
    if (question && question.index !== undefined && question.field?.type) {
      setSelectedQuestion(question.field.type);
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
            setInputError([]);
            setSelectedQuestion(q);
            setQuestionOptions({
              ...questionOptions,
              type: q,
            });
          }}
        >
          <div className="relative mt-1">
            <Listbox.Button className="border rounded-md border-gray-100 p-1 flex relative items-center justify-center">
              <div className="flex items-center justify-center">
                <InputIcon type={selectedQuestion} color="#0E0333" />
                <span className="mx-1 text-grey-400 font-medium">{typeToText(selectedQuestion)}</span>
                <ChevronDownIcon className="text-grey-400 h-5 w-5 ml-8" aria-hidden="true" />
              </div>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="border rounded-md p-2 mt-2 border-grey-100 w-[208px] overflow-auto">
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
                        <span className="mt-0.5 flex items-center text-grey-500 focus:text-violet-400">
                          <InputIcon className="focus:text-white" type={q} />
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

  const checkForErrors = (): boolean => {
    setInputError([]);
    const errors = [];

    if (selectedQuestion === INITIAL_VALUE) {
      errors.push("Please select a question type.");
    }
    if (selectedQuestion !== INITIAL_VALUE && !questionOptions.title) {
      errors.push("Question title is required.");
    }
    if (questionOptions.type === "checkbox" && questionOptions.options?.[0] === "") {
      errors.push("Please provide at least 1 option.");
    }
    if ((questionOptions.type === "multiple-choice" || questionOptions.type === "dropdown")
      && (!questionOptions.options || questionOptions.options?.length < 2 || questionOptions.options?.[1] === "")) {
      errors.push("Please provide at least 2 options.");
    }

    setInputError(errors);
    return (errors.length > 0);
  }

  const checkForOptions = () => {
    switch (questionOptions.type) {
      case "short-answer":
      case "email":
      case "address":
      case "paragraph":
        setQuestionOptions(
          {
            ...questionOptions,
            options: [],
          }
        )
        break;
    }
  }

    const renderError = (errors: string[]) => {
      return (
        <div className="bg-pink-100 pb-3 text-sm mt-4">
          <div className="text-red-100 pt-3 pl-3 pb-2 grid grid-flow-col grid-cols-10  flex items-center">
            <div className="col-span-1 w-5"><XCircleIcon /></div>
            <div className="col-span-9">
              {`There ${errors.length === 1 ? "was 1 error" : `were ${errors.length} errors`} with your form submission:`}
            </div>
          </div>
          {errors.map((error) => (<div className="text-[#0e0333] pt-1 pl-3 grid grid-flow-col grid-cols-10">
            <div className="col-span-1"></div>
            <div className="col-span-9">
              <span className="text-md pr-2 pt-1">&bull;</span>{error}
            </div>
          </div>)
          )}
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
              {inputError.length > 0 && renderError(inputError)}
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
                    checkForOptions();
                    if (!checkForErrors()) {
                      setIsOpen(false);
                      onSave({
                        ...initialQuestion,
                        field: {
                          ...questionOptions
                        }
                      })
                    }
                  }
                  }
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
