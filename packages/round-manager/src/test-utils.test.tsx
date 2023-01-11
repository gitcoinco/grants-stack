import { createContext, useContext } from "react";
import { render } from "@testing-library/react";
import { wrapInContexts } from "./test-utils";
import { ProgramContextType } from "./context/program/ReadProgramContext";

type ExampleContextValueType = { value: string | null };
const ExampleContext = createContext<ExampleContextValueType>({ value: null });

const ExampleContextConsumer = () => {
  const context = useContext(ExampleContext);

  return <div>{context.value}</div>;
};

describe("wraps tested elements with contexts", function () {
  it("should access context value", function () {
    const component = wrapInContexts<
      ExampleContextValueType | ProgramContextType
    >(<ExampleContextConsumer />, [
      { context: ExampleContext, value: { value: "test value" } },
    ]);

    const view = render(component);
    expect(view.getByText("test value")).toBeInTheDocument();
  });
});
