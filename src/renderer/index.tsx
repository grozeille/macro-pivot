import * as electron from "electron";
import {ipcRenderer, remote, shell} from "electron";
import SplitPane from "react-split-pane";
import * as he from "he";
import * as React from "react";
import * as ReactDOM from "react-dom";
import MonacoEditor from "react-monaco-editor";
// import * as monaco from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ResizeObserver } from "resize-observer";
import LeftPanel from "./components/LeftPanel";
import StdoutPanel from "./components/StdoutPanel";
import CentralPanel from "./components/CentralPanel";

const app = remote.app;
const browserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

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
                <LeftPanel someDefaultValue="Files" />
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

// configure the editor
const code = ["import xlwings as xw",
    "import pandas as pd",
    "import sys",
    "import logging",
    "",
    "def run_macro(file_path, src_sheet_name, src_table_start, dest_sheet_name, dest_table_start):",
    "    wb = xw.Book(file_path)",
    "    sht = wb.sheets[src_sheet_name]"].join("\n");

// tslint:disable-next-line: no-var-requires
const chromeTheme = require("./themes/Chrome DevTools.json");
monaco.editor.defineTheme("chrome", chromeTheme);
monaco.editor.setTheme("chrome");

const editorContainer = document.getElementById("editor-container")!;
const editor = monaco.editor.create(editorContainer, {
    language: "python",
    theme: "vs-dark",
    value: code,
});

monaco.editor.setTheme("chrome");

function outputsize() {
    editor.layout();
}
outputsize();

new ResizeObserver(outputsize).observe(document.getElementById("editor-container")!);