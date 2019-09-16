import markReducer from './reducers'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { logger } from 'redux-logger'

let store = createStore(markReducer, applyMiddleware(thunk, logger))

export default store