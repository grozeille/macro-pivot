import SplitPane from "react-split-pane";
import * as React from "react";
import * as ReactDOM from "react-dom";
import LeftPanel from "./components/LeftPanel";
import StdoutPanel from "./components/StdoutPanel";
import CentralPanel from "./components/CentralPanel";

// import * as css from "./css/mui.min.css";
// https://stackoverflow.com/questions/41336858/how-to-import-css-modules-with-typescript-react-and-webpack
// https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10
const muiCss = require("./css/mui.min.css");
const muiJs = require("./mui.min.js");
const styleCss = require("./css/style.css");

ReactDOM.render(
    <div id="app-panel">
        <SplitPane split="vertical" minSize={200}>
            <div id="file-panel" className="split content">
                <LeftPanel />
            </div>
            <SplitPane split="horizontal" minSize={500}>
                <div id="editor-panel" className="split content">
                    <CentralPanel />
                </div>
                <div id="stdout-panel" className="split content">
                    <StdoutPanel />
                </div>
            </SplitPane>
        </SplitPane>
    </div>,
    document.querySelector("#app"));
