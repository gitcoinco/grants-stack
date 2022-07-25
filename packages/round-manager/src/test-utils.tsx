import { render as rtlRender } from "@testing-library/react"
import { Provider } from "react-redux"
import React from "react"
import { api } from "./features/api"
import { configureStore } from "@reduxjs/toolkit"
import history from "./history"
import { ReduxRouter } from "@lagunovsky/redux-react-router"

// @ts-ignore
function reducer(ui, {
  // @ts-ignore
  preloadedState,
  store = configureStore({ reducer: { api: api.reducer }, preloadedState }),
  ...renderOptions
} = {}) {
  // @ts-ignore
  function Wrapper({ children }) {
    return (
      <Provider store={ store }>
        <ReduxRouter history={ history } store={ store }>
          { children }
        </ReduxRouter>
      </Provider>
    )
  }

  return rtlRender(ui,{wrapper: Wrapper, ...renderOptions})
}

export * from "@testing-library/react"
export { reducer }
