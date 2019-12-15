
import { ACTION_TYPES } from './actions'
import * as _ from 'lodash'

const defaultState = {
    lightsOn: false,
    profile: null,
    profileRequestInProgress: false,
    requestedImages: [],
    receivedImages: []
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
                profile: action.profile
            })
        case ACTION_TYPES.REQUEST_PROFILE_IMAGE:
            return Object.assign({}, state, {
                requestedImages: state.requestedImages.concat([action.imageUrl])
            })
        case ACTION_TYPES.RECEIVE_PROFILE_IMAGE:
            return Object.assign({}, state, {
                requestedImages: _.without(state.requestedImages, action.imageUrl),
                receivedImages: state.receivedImages.concat([action.imageUrl])
            })
        default:
            if(!action.type.startsWith("@@"))
                console.warn("Unknown action type: " + action.type)
            return state
    }
}