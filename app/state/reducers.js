
import { ACTION_TYPES } from './actions'

const defaultState = {
    lightsOn: false
}

export default function reducer(state = defaultState, action) {
    switch(action.type) {
        case ACTION_TYPES.TOGGLE_LIGHT:
            return {
                lightsOn: action.light
            }
        default:
            return state
    }
}