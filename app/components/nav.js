import React from 'react'

//Components
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Grid from '@material-ui/core/Grid'

//Icons
import PersonIcon from '@material-ui/icons/PersonOutline'
import BathtubIcon from '@material-ui/icons/BathtubOutlined'
import SchoolIcon from '@material-ui/icons/School'

//Styles
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    navButton: {
        marginLeft: theme.spacing(1)
    },
    buttonIcon: {
        marginRight: theme.spacing(0.5)
    },
    appBarCheckbox: {
        marginTop: "10px"
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
        <div>
            <AppBar position="sticky">
                <Toolbar>
                    <Grid container justify="space-between">
                        <Grid item>
                            <Button>
                                <Typography variant="h3" color="inherit">Mark Carrier</Typography>
                            </Button>
                            <IconButton className={classes.navButton}>
                                <PersonIcon className={classes.buttonIcon} />
                                <Typography variant="button" color="inherit">About</Typography>
                            </IconButton>
                            <IconButton className={classes.navButton}>
                                <BathtubIcon className={classes.buttonIcon} />
                                <Typography variant="button" color="inherit">Experience</Typography>
                            </IconButton>
                            <IconButton className={classes.navButton}>
                                <SchoolIcon className={classes.buttonIcon} />
                                <Typography variant="button" color="inherit">Education</Typography>
                            </IconButton>
                            </Grid>
                        <Grid item>
                            <Checkbox 
                                checked={state.checked}
                                onChange={handleChange}
                                value="light"
                                className={classes.appBarCheckbox}
                            />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </div>
    )
}