import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { AlertContainer } from "../../../components/base/Alert";
import { buildAlert, renderWrapped } from "../../../utils/test_utils";
import setupStore from "../../../store";

describe("<AlertContainer />", () => {
  test("it should show multiple alerts", async () => {
    const store = setupStore();
    const alert1 = buildAlert({
      id: 1,
      title: "First Alert",
      body: "Test content",
    });
    const alert2 = buildAlert({
      id: 2,
      title: "Second Alert",
      body: "Test content",
    });
    renderWrapped(<AlertContainer alerts={[alert1, alert2]} />, store);
    expect(screen.getByText(alert1.title!)).toBeInTheDocument();
    expect(screen.getByText(alert2.title!)).toBeInTheDocument();
  });
});
