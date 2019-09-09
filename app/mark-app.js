import React from 'react'
import ReactDOM from 'react-dom'
import MarkNav from './mark-nav'
//Components
import ThemeProvider from '@material-ui/styles/ThemeProvider'

//Theming & Styles
import { createMuiTheme } from '@material-ui/core/styles'

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
    return (
        <div>
            <MarkNav />
        </div>
    )
}

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>,
    document.getElementById('root')
);