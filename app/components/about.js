import React from 'react'
import Section from './section'

export default function About(props) {
    return <Section section={props.about} receivedImages={props.receivedImages} />
}
