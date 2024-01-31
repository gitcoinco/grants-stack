import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EditQuestion } from "../../api/types";
import AddQuestionModal from "../AddQuestionModal";

jest.mock("../../api/round");

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
    const modalDiv = await screen.queryByTestId("add-question-modal");
    expect(modalDiv).toBeInTheDocument();
    expect(modalDiv?.children[0]).toBeEmptyDOMElement;
  });
  it("shows proper question type when selected from menu", async () => {
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
    const modalDiv = screen.queryByTestId("add-question-modal");
    expect(modalDiv).toBeInTheDocument();

    const selectListButton = await screen.findByTestId("select-list-button");
    fireEvent.click(selectListButton, { target: { value: "dropdown" } });
    const multiSelectOption = await screen.findByText("Dropdown");
    expect(multiSelectOption).toBeInTheDocument();
  });
  it("saves question to form when Add is clicked", async () => {
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
    const modalDiv = screen.queryByTestId("add-question-modal");
    expect(modalDiv).toBeInTheDocument();

    const saveButton = await screen.findByRole("save");
    fireEvent.click(saveButton);
    expect(modalDiv?.children[0]).toBeEmptyDOMElement;

    // todo: check the form state to make sure the question was added
  });
  it("closes modal when cancel is clicked", async () => {
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
    const modalDiv = screen.queryByTestId("add-question-modal");
    expect(modalDiv).toBeInTheDocument();

    const cancelButton = await screen.findByRole("cancel");
    fireEvent.click(cancelButton);

    expect(modalDiv?.children[0]).toBeEmptyDOMElement;
  });
});

export const renderWithContext = (ui: JSX.Element) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);
