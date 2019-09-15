import markReducer from './reducers'
import { createStore } from 'redux'

let store = createStore(markReducer)

export default store