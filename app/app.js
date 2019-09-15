import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

//Components
import MarkNav from './containers/nav'
import MarkBulb from './containers/bulb'

import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'

//Theming & Styles
import "./mark.css"
import ThemeProvider from '@material-ui/styles/ThemeProvider'
import { makeStyles } from '@material-ui/core/styles'
import { createMuiTheme } from '@material-ui/core/styles'

import store from './state/store'

const unsubscribe = store.subscribe(() => console.log(store.getState()))

const useStyles = makeStyles(theme => ({
    mainContainer: {
        marginTop: theme.spacing(4)
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#fbc02d',
        },
        secondary: {
            main: '#689f38',
        },
    },
})

function App(props) {
    const classes = useStyles();

    return (
        <>
            <MarkNav />
            <Container className={classes.mainContainer}>
                <Grid container>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <MarkBulb />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
);