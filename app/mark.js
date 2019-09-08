import React from 'react'
import ReactDOM from 'react-dom'
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import './mark.css'

function App(props) {
    return (
        <div>
        <MarkNav />
        </div>
    )
}

function MarkNav(props) {
    return(
        <div>
            <AppBar>
                <Toolbar>
                    <Typography variant="subtitle1" color="inherit">Mark Carrier!</Typography>
                </Toolbar>
            </AppBar>
        </div>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);