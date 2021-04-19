import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {createMuiTheme,MuiThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 1000,
            md: 1200,
            lg: 1650,
            xl: 1920,
        }
    }
});

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    </MuiThemeProvider>,
  document.getElementById('root')
);
