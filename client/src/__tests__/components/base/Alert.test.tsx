import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { AlertContainer } from "../../../components/base/Alert";
import { buildAlert, renderWrapped } from "../../../utils/test_utils";
import setupStore from "../../../store";

describe("<AlertContainer />", () => {
  test("it should show multiple alerts", async () => {
    const store = setupStore();

    const alert1 = buildAlert({ id: 1, message: "First Alert" });
    const alert2 = buildAlert({ id: 2, message: "Second Alert" });

    renderWrapped(<AlertContainer alerts={[alert1, alert2]} />, store);

    expect(screen.getByText(alert1.message)).toBeInTheDocument();
    expect(screen.getByText(alert2.message)).toBeInTheDocument();
  });
});
