import React from 'react'

//Components
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

//Styles
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    navButton: {
        marginLeft: theme.spacing(1),
        
    },
    navText: {
        textDecoration: "none"
    },
    navButtons: {
        flexGrow: 1
    },
    buttonIcon: {
        marginRight: theme.spacing(0.5)
    },
    root: {
        flexGrow: 1
    }
}))

export default function MarkNav(props) {

    const [state, setState] = React.useState({
        checked: false
    })

    const classes = useStyles()

    const handleChange = function(event) {
        setState({checked: event.target.checked})
        props.toggleLight(event.target.checked)
    }

    return(
        <div className={classes.root}>
            <AppBar position="sticky">
                <Toolbar>
                    <Button color="inherit" href="https://markcarrier.info"><Typography>Mark Carrier</Typography></Button>
                    <div className={classes.navButtons}>
                        <Button className={classes.navButton} component={Link} to="/about">About</Button>
                        <Button className={classes.navButton} component={Link} to="/experience">Experience</Button>
                        <Button className={classes.navButton} component={Link} to="/education">Education</Button>
                    </div>
                    {/* <Checkbox 
                        checked={state.checked}
                        onChange={handleChange}
                        value="light"
                    /> */}
                </Toolbar>
            </AppBar>
        </div>
    )
}