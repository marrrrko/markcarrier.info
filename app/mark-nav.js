import React from 'react'

//Components
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'

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
    }
}))

export default function MarkNav(props) {

    const classes = useStyles()

    return(
        <div>
            <AppBar>
                <Toolbar>
                    <Button>
                        <Typography variant="h3" color="inherit">Mark Carrier</Typography>
                    </Button>
                    <Button className={classes.navButton}>
                        <PersonIcon className={classes.buttonIcon} />
                        <Typography variant="button" color="inherit">About Mark</Typography>
                    </Button>
                    <Button className={classes.navButton}>
                        <BathtubIcon className={classes.buttonIcon} />
                        Experience                        
                    </Button>
                    <Button className={classes.navButton}>
                        <SchoolIcon className={classes.buttonIcon} />
                        Education
                    </Button>
                    {/* <Button>
                        <PostsIcon />
                        Posts
                    </Button> */}
                </Toolbar>
            </AppBar>
        </div>
    )
}