import React from 'react'
import Skeleton from '@material-ui/lab/Skeleton'

export default function About(props) {
    if(props.about)
        return (<p>{props.about}</p>)
    else
        return (<Skeleton></Skeleton>)
}