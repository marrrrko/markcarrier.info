import React from 'react'
import CloudyIcon from '@material-ui/icons/WbCloudy'

export default function MarkBulb(props) {

    let component;
    if(props.light) {
        component = <CloudyIcon color="primary" fontSize="large" />
    } else {
        component = <CloudyIcon fontSize="large" />
    }

    return component
}

