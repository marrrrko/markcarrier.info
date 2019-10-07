import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import * as actions from './state/actions'

import { BrowserRouter, Switch, Route, Link } from "react-router-dom"

//Components
import About from './containers/about'
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
import { Typography } from '@material-ui/core';

//const unsubscribe = store.subscribe(() => console.log(store.getState()))

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
        <BrowserRouter>
            <div>
                <MarkNav />
                <br />                
                <Container className={classes.mainContainer}>            
                    <Grid container>
                        <Grid item xs={12}>
                        <Switch>
                            <Route exact path="/">
                                <Home />
                            </Route>
                            <Route path="/about/" component={About} />                        
                            <Route path="/experience">
                                <Paper>Experience <br />Experience <br />Experience <br />Experience <br />Experience <br /></Paper>
                            </Route>
                            <Route path="/education">
                                <Paper>Education <br />Education <br />Education <br />Education <br />Education <br /></Paper>
                            </Route>
                            <Route>
                                <NoMatch />
                            </Route>
                        </Switch>      
                    </Grid>
                </Grid>
            </Container>          
            </div>
        </BrowserRouter>
    )
}

function Home() {
    const classes = useStyles();
    return (
        <Paper className={classes.paper}>
            <MarkBulb />
        </Paper>)
}

function NoMatch() {
    return (<Paper>404 Not Found</Paper>)
}

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
);

store.dispatch(actions.fetchProfile())