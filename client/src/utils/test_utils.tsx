import { Provider } from "react-redux";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { render } from "@testing-library/react";
import history from "../history";
import setupStore from "../store";

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

export default {};
