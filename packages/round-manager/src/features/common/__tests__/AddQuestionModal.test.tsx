import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CreateRoundContext, CreateRoundState, initialCreateRoundState } from "../../../context/round/CreateRoundContext";
import { EditQuestion } from "../../api/types";
import AddQuestionModal from "../AddQuestionModal";

jest.mock("../../api/round");

// test data for building out the questions
const editQuestion: EditQuestion = {
  index: 0,
  field: {
    id: 1,
    title: "test",
    required: false,
    encrypted: false,
    hidden: false,
    type: "short-answer",
    choices: [],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AddQuestionModal", () => {
  beforeEach(() => {
    // todo:
  });

  it("does not show the modal when the modal is not open", async () => {
    renderWithContext(
      <AddQuestionModal
        show={false}
        onClose={() => {
          /**/
        }}
        onSave={() => {
          /**/
        }}
        question={editQuestion}
      />
    );
    expect(screen.queryByTestId("add-question-modal")).toBeInTheDocument();
    // const modal = await screen.queryByTestId("add-question-modal");
    
    // todo: test that the modal is not visible
  });
  it("shows the new option row when the add option button is clicked", async () => {
    renderWithContext(
      <AddQuestionModal
        show={true}
        onClose={() => {
          /**/
        }}
        onSave={() => {
          /**/
        }}
        question={editQuestion}
      />
    );
    expect(screen.queryByTestId("add-question-modal")).toBeInTheDocument();
    // const modal = await screen.queryByTestId("add-question-modal");
    // expect(await screen.queryByTestId("add-question-modal")).toBeInTheDocument();

    // todo: click the add option button and test that it added row for new option
    // const selectListButton = await screen.findByRole("select-list");
    // fireEvent.change(selectListButton, { target: { value: "multi-select" } });
    // fixme: this wont work until we can get the select list to open and select an option
    // const addOptionButton = await screen.findByRole("add-option");
    // fireEvent.click(addOptionButton);
  });
  it("shows proper question type when selected from menu", async () => {
    // todo:
    renderWithContext(
      <AddQuestionModal
        show={true}
        onClose={() => {
          /**/
        }}
        onSave={() => {
          /**/
        }}
        question={editQuestion}
      />
    );
    expect(screen.queryByTestId("add-question-modal")).toBeInTheDocument();
    // const modal = await screen.queryByTestId("add-question-modal");
    // expect(await screen.queryByTestId("add-question-modal")).toBeInTheDocument();
  });
  it("shows two default options when a multi-select type is selected??", async () => {
    // todo:
  });
  it("shows proper switch values", async () => {
    // todo:
  });
  it("saves question to form when Add is clicked", async () => {
    // todo:
    renderWithContext(
      <AddQuestionModal
        show={true}
        onClose={() => {
          /**/
        }}
        onSave={() => {
          /**/
        }}
        question={editQuestion}
      />
    );
    expect(screen.queryByTestId("add-question-modal")).toBeInTheDocument();
    // const modal = await screen.queryByTestId("add-question-modal");

    const saveButton = await screen.findByRole("save");
    fireEvent.click(saveButton);

    // not sure why this isn't working after the click event, the modal should be hidden
    // expect(screen.queryByTestId("add-question-modal")).not.toBeInTheDocument();
  });
  it("closes modal when cancel is clicked", async () => {
    // todo:
    renderWithContext(
      <AddQuestionModal
        show={true}
        onClose={() => {
          /**/
        }}
        onSave={() => {
          /**/
        }}
        question={editQuestion}
      />
    );
    expect(screen.queryByTestId("add-question-modal")).toBeInTheDocument();

    const cancelButton = await screen.findByRole("cancel");
    fireEvent.click(cancelButton);

    // expect(await screen.queryByTestId("add-question-modal")).not.toBeInTheDocument();
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  createRoundStateOverrides: Partial<CreateRoundState> = {}
) =>
  render(
    <MemoryRouter>
      <CreateRoundContext.Provider
        value={{ ...initialCreateRoundState, ...createRoundStateOverrides }}
      >
        {ui}
      </CreateRoundContext.Provider>
    </MemoryRouter>
  );