
// ********************************
// Actions
// ********************************
export const ACTION_TYPES = {
    TOGGLE_LIGHT: "toggle-light",
    REQUEST_PROFILE: "request-profile",
    REQUEST_PROFILE_IMAGE: "request-profile-image",
    RECEIVE_PROFILE_IMAGE: "receive-profile-image",
    RECEIVE_PROFILE: "receive-profile"
}

// ********************************
// Action Creators
// ********************************
export function toggleLight(lightsOn) {
    return {
        type: ACTION_TYPES.TOGGLE_LIGHT,
        light: lightsOn
    }
}

export function requestProfile() {
    return {
        type: ACTION_TYPES.REQUEST_PROFILE
    }
}

export function receivedProfile(json) {
    return {
        type: ACTION_TYPES.RECEIVE_PROFILE,
        profile: json
    }
}

export function requestProfileImage(imageUrl) {
    return {
        type: ACTION_TYPES.REQUEST_PROFILE_IMAGE,
        imageUrl: imageUrl
    }
}

export function receiveProfileImage(imageUrl) {
    return {
        type: ACTION_TYPES.RECEIVE_PROFILE_IMAGE,
        imageUrl: imageUrl
    }
}
