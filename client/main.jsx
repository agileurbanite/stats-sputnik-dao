import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import { ContainerProvider } from "../imports/utils/container";

import App from "../imports/App";
//import * as serviceWorker from './serviceWorker';

if (Meteor.settings.public.node_env !== "development") {
 // console.log = function () {};
}

Meteor.startup(() => {
  render(
    <ContainerProvider>
      <App />
    </ContainerProvider>,
    document.getElementById("react-target")
  );
});

//serviceWorker.unregister();
