import React from 'react'

import Typography from '@material-ui/core/Typography'

import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import LinkedInIcon from '@material-ui/icons/LinkedIn'
import GitHubIcon from '@material-ui/icons/GitHub'
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera'
import EmailIcon from '@material-ui/icons/Email'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    bottomButtons: {
        marginTop: "20px",
        "& button": {
            marginLeft: "5px"
        },
        "& a": {
            marginLeft: "5px"
        }
    },
    dialogText: {
        textAlign: "center"
    }
}));

export default function BottomButtons(props) {
    let classes = useStyles()

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    let e1 = "m"
    let e2 = String.fromCharCode(64);
    let e3 = "markcarrie";
    let e4 = "r.info";
    let e = `${e1}${e2}${e3}${e4}`
    return( <Grid item xs={12} className={classes.bottomButtons}>

                <Button variant="contained" color="secondary" aria-label="Email" onClick={handleClickOpen}>
                    <EmailIcon />
                </Button>

                <Button 
                    variant="contained"
                    aria-label="LinkedIn Profile"
                    href="https://linkedin.com/in/markcarrier0x00/">
                    <LinkedInIcon />
                </Button>

                <Button 
                    variant="contained"
                    aria-label="GitHub Profile"
                    href="https://github.com/MarkCarrier/">
                    <GitHubIcon />
                </Button>

                <Button 
                    variant="contained"
                    aria-label="Flickr Profile"
                    href="https://flickr.com/photos/markcarrier/">
                    <PhotoCameraIcon />
                </Button>                

                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title"><Typography variant="h3">Send me an email</Typography></DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description" className={classes.dialogText}>
                        <a href={`mailto:${e}?subject=Hello from Website`} target="_blank">
                            <Typography>{e}</Typography>
                        </a>
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        Done
                    </Button>
                    </DialogActions>
                </Dialog>
            </Grid>)
}