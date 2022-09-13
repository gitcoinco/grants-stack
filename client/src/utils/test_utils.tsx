import react from "react";
import { Provider } from "react-redux";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import history from "../history";
import setupStore from "../store";
import { render } from "@testing-library/react";

export const renderWrapped = (ui: React.ReactElement, store = setupStore()) => {
  const wrapped = (
    <Provider store={store}>
      <ReduxRouter store={store} history={history}>
        {ui}
      </ReduxRouter>
    </Provider>
  );

  return { store, ...render(wrapped) };
};
