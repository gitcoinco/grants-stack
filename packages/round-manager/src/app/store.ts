import {
  combineReducers,
  Middleware,
} from "redux"

import {
  createRouterMiddleware,
  createRouterReducer
} from "@lagunovsky/redux-react-router"

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import thunkMiddleware from "redux-thunk"

import history from "../history"
import { api } from "../features/api"


let middlewares: Middleware[] = [
  thunkMiddleware,
  createRouterMiddleware(history),
  api.middleware
]

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