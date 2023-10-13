/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon, PlusIcon, XCircleIcon } from "@heroicons/react/solid";
import { Button } from "common/src/styles";
import { Fragment, useEffect, useState } from "react";
import { EditQuestion, InputType } from "../api/types";
import { SchemaQuestion, typeToText } from "../api/utils";
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

const questions: InputType[] = [
  "short-answer",
  "paragraph",
  "multiple-choice",
  "checkbox",
  "dropdown",
  "email",
  "address",
  "link",
  "number",
];

function AddQuestionModal({
  onSave,
  question,
  show,
  onClose,
}: AddQuestionModalProps) {
  const questionExists = question && question.index !== undefined;

  const [isOpen, setIsOpen] = useState(show);
  const initialQuestion = question;
  const [questionOptions, setQuestionOptions] = useState<SchemaQuestion>({
    id: 0,
    title: "",
    required: false,
    encrypted: false,
    hidden: true,
    type: "short-answer",
    choices: [],
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
    return (
      <div className="flex flex-row justify-between mt-6 w-[80%]">
        <BaseSwitch
          testid="required-toggle"
          key="required"
          activeLabel="*Required"
          inactiveLabel="Optional"
          value={
            (questionOptions["required" as keyof SchemaQuestion] as boolean) ||
            false
          }
          handler={(b: boolean) =>
            setQuestionOptions({ ...questionOptions, ["required"]: b })
          }
        />
        <BaseSwitch
          testid="encrypted-toggle"
          key="encrypted"
          activeLabel="Encrypted"
          inactiveLabel="Not Encrypted"
          value={
            (questionOptions["encrypted" as keyof SchemaQuestion] as boolean) ||
            false
          }
          handler={(b: boolean) =>
            setQuestionOptions({ ...questionOptions, ["encrypted"]: b })
          }
        />
        <BaseSwitch
          testid="hidden-toggle"
          key="hidden"
          activeLabel="Shown in Explorer"
          inactiveLabel="Hidden from Explorer"
          value={
            !(questionOptions["hidden" as keyof SchemaQuestion] as boolean) ||
            false
          }
          handler={(b: boolean) =>
            setQuestionOptions({ ...questionOptions, ["hidden"]: !b })
          }
        />
      </div>
    );
  };

  function answerArea(inner: JSX.Element) {
    return (
      <div>
        <div className="flex flex-col mt-6">
          <hr className="mb-6" />
          <span className="mb-2 text-[14px]">Question Title</span>
          <input
            className="border border-grey-100 rounded-sm"
            data-testid="question-title-input"
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
        data-testid="add-option"
        onClick={() => {
          const renderOptions = questionOptions.choices || [];
          renderOptions.push("");
          setQuestionOptions({
            ...questionOptions,
            choices: renderOptions,
          });
        }}
        className="bg-violet-100 py-[6px] px=2 w-[336px] rounded mt-2"
      >
        <span className="flex flex-row justify-center">
          <PlusIcon className="h-5 w-5 text-violet-400 font-medium align-middle mt-[1px]" />
          <span className="ml-2 text-violet-400 font-medium">Add Option</span>
        </span>
      </Button>
    );
  };

  function addOptions() {
    const renderOptions = questionOptions.choices || [];

    if (
      renderOptions.length === 0 ||
      (selectedQuestion === "multiple-choice" && renderOptions.length === 1)
    ) {
      renderOptions.push("");
      setQuestionOptions({
        ...questionOptions,
        choices: renderOptions,
      });
    }

    const render: JSX.Element[] = [];

    for (let i = 0; i < renderOptions.length; i++) {
      render.push(
        <div role="option" key={i + 1} className="flex flex-col">
          <Option
            index={i + 1}
            value={questionOptions.choices?.[i] || ""}
            onChange={(event: any) => {
              event.preventDefault();
              if (questionOptions.choices?.length)
                setQuestionOptions({
                  ...questionOptions,
                  choices: [
                    ...questionOptions.choices.slice(0, i),
                    event.target.value,
                    ...questionOptions.choices.slice(i + 1),
                  ],
                });
            }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onDeleteOption={() => {
              if (questionOptions.choices?.length)
                setQuestionOptions({
                  ...questionOptions,
                  choices: [
                    ...questionOptions.choices.slice(0, i),
                    ...questionOptions.choices.slice(i + 1),
                  ],
                });
            }}
            options={[questionOptions]}
          />
        </div>
      );
    }

    return (
      <>
        <div className="border-l mb-2 mt-4">{render}</div>
        <AddOptionButton />
      </>
    );
  }

  function QuestionSelectList() {
    return (
      <div data-testid="select-list" className="w-[208px]">
        <Listbox
          value={selectedQuestion}
          name="question"
          data-testid="select-question"
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
            <Listbox.Button
              data-testid="select-list-button"
              className="border rounded-md border-gray-100 p-1 flex relative items-center justify-center"
            >
              <div className="flex items-center justify-center">
                <InputIcon type={selectedQuestion} />
                <span className="mx-1 text-[16px] text-grey-400 font-medium">
                  {typeToText(selectedQuestion)}
                </span>
                <ChevronDownIcon
                  className="text-grey-400 h-5 w-5 ml-8"
                  aria-hidden="true"
                />
              </div>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="border rounded-md border-grey-100 w-[208px] overflow-auto h-23 absolute z-40">
                {questions.map((q, index) => (
                  <Listbox.Option
                    data-testid="select-list-option"
                    key={index}
                    value={q}
                    className="cursor-pointer active:bg-violet-400 active:text-white bg-white text-black w-full hover:text-white"
                  >
                    {({ active }) => (
                      <span
                        className={`flex w-full py-2 ${
                          active
                            ? "bg-violet-400 text-white"
                            : "bg-white text-black"
                        }`}
                      >
                        <span className="mt-0.5 flex items-center">
                          <InputIcon className="mr-3 ml-[20px]" type={q} />
                        </span>
                        <span className="flex text-md w-full mt-0.5 ">
                          {typeToText(q)}
                        </span>
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
    );
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
    if (
      questionOptions.type === "checkbox" &&
      questionOptions.choices?.[0] === ""
    ) {
      errors.push("Please provide at least 1 option.");
    }
    if (
      questionOptions.type === "multiple-choice" &&
      (!questionOptions.choices ||
        questionOptions.choices?.length < 2 ||
        questionOptions.choices?.[1] === "")
    ) {
      errors.push("Please provide at least 2 options.");
    }
    if (
      questionOptions.type === "dropdown" &&
      (!questionOptions.choices ||
        questionOptions.choices?.length < 1 ||
        questionOptions.choices?.[0] === "")
    ) {
      errors.push("Please provide at least 1 option.");
    }
    if (questionOptions.encrypted && !questionOptions.hidden) {
      errors.push(
        "Questions cannot be marked as encrypted and shown in explorer. Please select one."
      );
    }

    setInputError(errors);
    return errors.length > 0;
  };

  const checkForOptions = (): SchemaQuestion => {
    let result: SchemaQuestion = { ...questionOptions };

    switch (questionOptions.type) {
      case "short-answer":
      case "email":
      case "address":
      case "paragraph":
      case "link":
      case "number":
        result = { ...questionOptions, choices: [] };
        break;
    }

    return result;
  };

  const renderError = (errors: string[]) => {
    return (
      <div className="bg-pink-100 pb-3 text-sm mt-4">
        <div className="text-red-100 pt-3 pl-3 pb-2 grid grid-flow-col grid-cols-10 items-center">
          <div className="col-span-1 w-5">
            <XCircleIcon />
          </div>
          <div className="col-span-9">
            {`There ${
              errors.length === 1
                ? "was 1 error"
                : `were ${errors.length} errors`
            } with your form submission:`}
          </div>
        </div>
        {errors.map((error) => (
          <div className="text-[#0e0333] pt-1 pl-3 grid grid-flow-col grid-cols-10">
            <div className="col-span-1"></div>
            <div className="col-span-9">
              <span className="text-md pr-2 pt-1">&bull;</span>
              {error}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div data-testid="add-question-modal">
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="relative z-50 max-w-[628px] max-h-[557px]"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-full max-w-[628px] rounded bg-white p-6">
            <Dialog.Title className="mb-4 -mt-4">
              <span className="text-[18px] text-grey-500">
                {questionExists ? `Edit Question` : `Add Question`}
              </span>
            </Dialog.Title>
            <Dialog.Description className="mb-2 text-grey-500 font-normal">
              <span className="text-[14px]">Question Type</span>
            </Dialog.Description>
            <div>
              <QuestionSelectList />
            </div>
            <div>
              <div className="flex flex-col mt-2">
                {selectedQuestion !== INITIAL_VALUE &&
                  answerArea(
                    selectedQuestion == "multiple-choice" ||
                      selectedQuestion == "checkbox" ||
                      selectedQuestion == "dropdown" ? (
                      addOptions()
                    ) : (
                      <></>
                    )
                  )}
              </div>
            </div>
            {inputError.length > 0 && renderError(inputError)}
            <div className="mt-10 flex flex-row justify-end">
              <button
                role="cancel"
                className="border rounded-[4px] border-gray-100 p-3 mr-2 w-[140px]"
                onClick={() => {
                  setIsOpen(false);
                  onClose();
                }}
              >
                Cancel
              </button>
              <button
                role="save"
                data-testid="save-question"
                className="border rounded-[4px] bg-violet-400 p-3 mr-6 w-[140px] text-white"
                onClick={async () => {
                  if (!checkForErrors()) {
                    setIsOpen(false);
                    onSave({
                      ...initialQuestion,
                      field: {
                        ...checkForOptions(),
                      },
                    });
                  }
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
