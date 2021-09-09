import React, {Suspense, lazy, useEffect} from "react";
import {Route, Switch} from 'react-router-dom'
import Index from './ui/pages/Index'
import {BrowserRouterHook} from './utils/use-router'
import NotFound from "./ui/pages/NotFound";
import { createTheme, ThemeProvider, responsiveFontSizes} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {useGlobalState, useGlobalMutation} from './utils/container'
import blue from '@material-ui/core/colors/blue';

function App() {
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();


  let theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          type: stateCtx.config.darkMode,
          primary: {
             main: blue['A700'],
          },
        },
      }),
    [stateCtx.config.darkMode],
  );

  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <BrowserRouterHook>
        <Switch>
          <Route exact path="/" component={Index}/>
          <Route path="*">
            <NotFound/>
          </Route>
        </Switch>
      </BrowserRouterHook>
    </ThemeProvider>
  )
}

export default App;

