import React, {Suspense, lazy, useEffect} from "react";
import {Route, Switch} from 'react-router-dom'
import Index from './ui/pages/Index'
import {BrowserRouterHook} from './utils/use-router'
import NotFound from "./ui/pages/NotFound";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {useGlobalState, useGlobalMutation} from './utils/container'

function App() {
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();


  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: stateCtx.config.darkMode,
        },
      }),
    [stateCtx.config.darkMode],
  );

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

