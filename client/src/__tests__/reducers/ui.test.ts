import { uiReducer } from "../../reducers/ui";
import { buildAlert } from "../../utils/test_utils";

describe("uiReducer", () => {
  describe("alerts", () => {
    test("it should add an alert", async () => {
      const state = { alerts: [] };
      const alert = buildAlert();
      const newState = uiReducer(state, {
        type: "UI_ALERT_ADDED",
        payload: alert,
      });
      expect(newState).toEqual({ alerts: [alert] });
    });

    test("it should remove an alert", async () => {
      const alert1 = buildAlert({ id: 1 });
      const alert2 = buildAlert({ id: 2 });

      const state = { alerts: [alert1, alert2] };
      const newState = uiReducer(state, {
        type: "UI_ALERT_REMOVED",
        payload: 1,
      });

      expect(newState).toEqual({ alerts: [alert2] });
    });
  });
});
