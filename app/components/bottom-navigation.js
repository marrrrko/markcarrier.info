import React from 'react'
import Box from '@material-ui/core/Box'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'
import { Link } from "react-router-dom"

import PersonIcon from '@material-ui/icons/Person'
import BathtubIcon from '@material-ui/icons/Bathtub'
import SchoolIcon from '@material-ui/icons/School'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    stickToBottom: {
        width: '100%',
        position: 'fixed',
        bottom: 0,
    },
}));

export default function BottomMarkNavigation(props) {
    const classes = useStyles()

    const [value, setValue] = React.useState('recents');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (<Box display={{ xs: 'block', sm: 'none' }} >
                <BottomNavigation value={value} onChange={handleChange} showLabels={true} className={classes.stickToBottom}>
                    <BottomNavigationAction
                        component={Link}
                        to="/about"
                        value="about"
                        label="About"
                        icon={<PersonIcon />}
                    />
                    <BottomNavigationAction
                        component={Link}
                        to="/experience"
                        value="experience"
                        label="Experience"
                        icon={<BathtubIcon />}
                    />
                    <BottomNavigationAction
                        component={Link}
                        to="/education"
                        value="education"
                        label="Education"
                        icon={<SchoolIcon />}
                    />
                </BottomNavigation>  
            </Box>)
}
            