import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CreateRoundContext, CreateRoundState, initialCreateRoundState } from "../../../context/round/CreateRoundContext";
import { renderWrapped } from "../../../test-utils";
import { EditQuestion } from "../../api/types";
import AddQuestionModal from "../AddQuestionModal";

// test data for building out the questions
const editQuestion: EditQuestion = {
  index: 0,
  field: {
    title: "test",
    required: false,
    encrypted: false,
    hidden: false,
    inputType: "short-answer",
    options: [],
  },
};

describe("AddQuestionModal", () => {
  it("does not show the modal when the modal is not open", async () => {
    renderWrapped(
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
    
    // expect(await screen.findByTestId("add-question-modal")).not.toBeInTheDocument();
  });
  it("shows the modal when the add question button is clicked", async () => {
    renderWrapped(
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
  });
  it("shows proper question type when selected from menu", async () => {
    // todo:
  });
  it("shows two default options when a multi-select type is selected??", async () => {
    // todo:
  });
  it("shows proper switch values", async () => {
    // todo:
  });
  it("adds option when add option is clicked", async () => {
    // todo:
  });
  it("saves question to form when Add is clicked", async () => {
    // todo:
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

    const cancelButton = screen.getByRole("button", { name: "Cancel"});
    fireEvent.click(cancelButton);

    // expect(screen.queryByTestId("add-question-modal")).not.toBeInTheDocument();
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