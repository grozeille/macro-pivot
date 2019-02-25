import * as React from "react";
import * as ReactDOM from "react-dom";
import AppPanel from "./components/AppPanel";

// import * as css from "./css/mui.min.css";
const muiCss = require("./css/mui.min.css");
const muiJs = require("./mui.min.js");
const styleCss = require("./css/style.css");

ReactDOM.render(
    <AppPanel />,
    document.querySelector("#app"));
