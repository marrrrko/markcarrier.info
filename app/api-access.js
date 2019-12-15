import * as actions from './state/actions'

export function getProfile() {
    return function(dispatch) {
        dispatch(actions.requestProfile())
        return fetchProfile()
        .then((json) => {
            dispatch(actions.receivedProfile(json))
        })
    }
}

function fetchProfile() {
    return fetch("/api/profile")
    .then(
        response => response.json(),
        error => console.log("Failed to fetch profile", error)
    )
}

export function getProfileImage(imageUrl) {
    return function(dispatch) {
        dispatch(actions.requestProfileImage(imageUrl))
        return fetchProfileImage(imageUrl)
        .then(imageUrl => {
            dispatch(actions.receiveProfileImage(imageUrl))
        })          
    }
}

function fetchProfileImage(imageUrl) {
    return new Promise(function(resolve, reject) {
        let img = new Image()
        img.src = imageUrl
        img.onload = () => {            
            resolve(imageUrl)
        }
    })
}

export function getProfileAndProfileImages() {
    return function(dispatch, getState) {
        dispatch(getProfile())
        .then(function() {
            let profile = getState().profile
            let imageUrls = Object.keys(profile).map(key => profile[key])
                .map(section => section.image)
                .filter(sectionImage => sectionImage != null)
                .map(sectionImage => sectionImage.url)
            return Promise.all(imageUrls.map(imageUrl => dispatch(getProfileImage(imageUrl))))
        })
    }
}