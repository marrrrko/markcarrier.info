import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import * as actions from './state/actions'

import { BrowserRouter, Switch, Route, Link } from "react-router-dom"

//Components & Containers
import About from './containers/about'
import Experience from './containers/experience'
import Education from './containers/education'
import MarkNav from './containers/nav'
import MarkBulb from './containers/bulb'

import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'

//Theming & Styles
import "./mark.css"

import { makeStyles } from '@material-ui/core/styles'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

import store from './state/store'

//const unsubscribe = store.subscribe(() => console.log(store.getState()))

const useStyles = makeStyles(theme => ({
    mainContainer: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(8)
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));

const theme = createMuiTheme({
    typography: {
        fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
        h1: {
            fontSize: "4.5rem",
            fontWeight: 150
        },
        h2: {
            fontSize: "2rem",
            fontWeight: 400
        },
        h3: {
            fontSize: "2rem",
            fontWeight: 150
        },
        h4: {
            fontSize: "1.5rem",
            fontWeight: 400
        },
        h5: {
            fontSize: "1.5rem",
            fontWeight: 100
        },
        h6: {
            fontSize: "1rem",
            fontWeight: 400
        },
        useNextVariants: true,
    },
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
        <Provider store={store}>
            <MuiThemeProvider theme={theme}>
                <BrowserRouter>
                    <Box>
                        <MarkNav />
                        <br />                
                        <Container className={classes.mainContainer}>            
                            <Grid container>
                                <Grid item xs={12}>
                                    <Switch>
                                        <Route exact path="/">
                                            <span>Hi there</span>
                                            <Home />
                                        </Route>
                                        <Route path="/about/">                        
                                            <About />
                                        </Route>
                                        <Route path="/experience">
                                            <Experience />
                                        </Route>
                                        <Route path="/education">
                                            <Education />
                                        </Route>
                                        <Route>
                                            <NoMatch />
                                        </Route>
                                    </Switch>      
                                </Grid>
                            </Grid>
                        </Container>    
                    </Box>
                </BrowserRouter>
            </MuiThemeProvider>
        </Provider>
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
    <App />,
    document.getElementById('root')
);

store.dispatch(actions.fetchProfile())