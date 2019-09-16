
import { ACTION_TYPES } from './actions'

const defaultState = {
    lightsOn: false,
    profile: null,
    profileRequestInProgress: false
}

export default function reducer(state = defaultState, action) {
    switch(action.type) {
        case ACTION_TYPES.TOGGLE_LIGHT:
            return Object.assign({}, state, {
                lightsOn: action.light
            })
        case ACTION_TYPES.REQUEST_PROFILE:
            return Object.assign({}, state, {
                profileRequestInProgress: true
            })
        case ACTION_TYPES.RECEIVE_PROFILE:
            return Object.assign({}, state, {
                profileRequestInProgress: false,
                profile: action.json
            })
        default:
            if(!action.type.startsWith("@@"))
                console.warn("Unknown action type: " + action.type)
            return state
    }
}