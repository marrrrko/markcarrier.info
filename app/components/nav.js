import React from 'react'

//Components
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

//Icons
import PersonIcon from '@material-ui/icons/PersonOutline'
import BathtubIcon from '@material-ui/icons/BathtubOutlined'
import SchoolIcon from '@material-ui/icons/School'

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
    },


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
                    <Link to="/">
                        <Typography variant="h6" className={classes.title} noWrap>
                            Mark Carrier
                        </Typography>
                    </Link>
                    <div className={classes.navButtons}>
                        <Link to="/about">
                            <IconButton className={classes.navButton}>
                                <PersonIcon className={classes.buttonIcon} />
                                <Typography variant="button" color="inherit" className={classes.navText}>About</Typography>
                            </IconButton>
                        </Link>
                        <Link to="/experience">
                            <IconButton className={classes.navButton}>
                                <BathtubIcon className={classes.buttonIcon} />
                                <Typography variant="button" color="inherit">Experience</Typography>
                            </IconButton>
                        </Link>
                        <Link to="/education">
                            <IconButton className={classes.navButton}>
                                <SchoolIcon className={classes.buttonIcon} />
                                <Typography variant="button" color="inherit">Education</Typography>
                            </IconButton>                       
                        </Link>
                    </div>
                    <Checkbox 
                        checked={state.checked}
                        onChange={handleChange}
                        value="light"
                    />
                </Toolbar>
            </AppBar>
        </div>
    )
}