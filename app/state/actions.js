
export const ACTION_TYPES = {
    TOGGLE_LIGHT: "toggle-light",
    REQUEST_PROFILE: "request-profile",
    RECEIVE_PROFILE: "receive-profile"
}

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
        json: json
    }
}

export function fetchProfile() {
    return function(dispatch) {
        dispatch(requestProfile())
        return fetch("/api/profile")
        .then(
            response => response.json(),
            error => console.log("Failed to fetch profile", error)
        )
        .then((json) => {
            dispatch(receivedProfile(json))
        })
    }
}