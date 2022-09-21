import { Provider } from "react-redux";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { render } from "@testing-library/react";
import history from "../history";
import setupStore from "../store";
import { Round, Metadata } from "../types";

export const buildRound = (round: any): Round => ({
  address: "0x8888",
  applicationsStartTime: 1663751953,
  applicationsEndTime: 2,
  roundStartTime: 3,
  roundEndTime: 4,
  token: "test-token",
  roundMetaPtr: {},
  roundMetadata: {},
  applicationMetaPtr: {},
  applicationMetadata: {},
  ...round,
});

export const buildProjectMetadata = (metadata: any): Metadata => ({
  protocol: 1,
  pointer: "0x7878",
  id: 1,
  title: "title",
  description: "description",
  roadmap: "roadmap",
  challenges: "challenges",
  website: "http://example.com",
  ...metadata,
});

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
