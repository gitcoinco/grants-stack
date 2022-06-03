import {
  combineReducers,
  Middleware,
  MiddlewareAPI,
  Dispatch
} from "redux"

import {
  createRouterMiddleware,
  createRouterReducer
} from "@lagunovsky/redux-react-router"

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import thunkMiddleware from "redux-thunk"

import history from "../history"
import { api } from "../features/api"


const logger: Middleware =
  ({ getState }: MiddlewareAPI) =>
    (next: Dispatch) =>
      (action) => {
        console.log("dispatch", action)
        const returnValue = next(action)
        console.log("state", getState())
        return returnValue
      }

let middlewares: Middleware[] = [
  thunkMiddleware,
  createRouterMiddleware(history),
  api.middleware
]

if (process.env.NODE_ENV !== "production") {
  middlewares = [...middlewares, logger]
}

export const store = configureStore({
  reducer: combineReducers({
    router: createRouterReducer(history),
    [api.reducerPath]: api.reducer
  }),
  middleware: middlewares
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>