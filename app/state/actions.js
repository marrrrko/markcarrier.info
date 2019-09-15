
export const ACTION_TYPES = {
    TOGGLE_LIGHT: "toggle-light"
}

export function toggleLight(lightsOn) {
    return {
        type: ACTION_TYPES.TOGGLE_LIGHT,
        light: lightsOn
    }
}