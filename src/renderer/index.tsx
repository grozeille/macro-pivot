import * as electron from "electron";
import {ipcRenderer, remote, shell} from "electron";
import Split from "split.js";
import * as he from "he";
import * as React from "react";
import * as ReactDOM from "react-dom";
import MonacoEditor from "react-monaco-editor";
// import * as monaco from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// https://github.com/Microsoft/monaco-editor/issues/933
import { ResizeObserver } from "resize-observer";

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
        <div id="left-panel" className="split split-horizontal">
            <div id="file-panel" className="split content">
            </div>
        </div>
        <div id="central-panel" className="split split-horizontal">
            <div id="editor-panel" className="split content">
            </div>
            <div id="stdout-panel" className="split content">
            </div>
        </div>
    </div>,
    document.querySelector("#app"));

// Setup split planels
Split(["#left-panel", "#central-panel"], {
    cursor: "col-resize",
    gutterSize: 8,
    sizes: [25, 75],
});

Split(["#editor-panel", "#stdout-panel"], {
    cursor: "row-resize",
    direction: "vertical",
    gutterSize: 8,
    sizes: [75, 25],
});

// Left Panel
ReactDOM.render(
    <div id="file-container">
        Files
    </div>,
    document.querySelector("#file-panel"));

// Central down panel
ReactDOM.render(
    <div id="stdout-container">
        <div id="stdout" className="mui--text-light"></div>
    </div>,
    document.querySelector("#stdout-panel"));

// Central up panel
ReactDOM.render(
    <div id="editor-tab-panel">
        <ul className="mui-tabs__bar">
            <li className="mui--is-active"><a data-mui-toggle="tab" data-mui-controls="macro-tab">Executer</a></li>
            <li><a data-mui-toggle="tab" data-mui-controls="editor-tab">Editeur</a></li>
        </ul>

        <div className="mui-tabs__pane mui--is-active" id="macro-tab">
            <div id="central-container" className="mui-container">
            </div>
        </div>

        <div className="mui-tabs__pane" id="editor-tab">
            <div id="editor-container"></div>
        </div>
    </div>,
    document.querySelector("#editor-panel"));

// The form to execute the macro
ReactDOM.render(
    <form id="macroForm" action="#" className="mui-form">
        <div className="mui-row">
            <div className="mui-col-md-9">
                <div className="mui-textfield mui-textfield--float-label">
                    <input id="file" type="text"/>
                    <label>Fichier excel</label>
                </div>
            </div>
            <div className="mui-col-md-3">
                <div className="mui--text-right">
                    <button
                        id="fileDialog"
                        type="button"
                        className="mui-btn mui-btn--raised mui-btn">Parcourir</button>
                </div>
            </div>
        </div>
        <button
            id="macroFormButton"
            type="submit"
            className="mui-btn mui-btn--raised mui-btn--primary">Executer</button>
    </form>,
    document.querySelector("#central-container"));

// Setup form to execute macro
const submitForm = document.querySelector("#macroForm")!;

submitForm.addEventListener("submit", (event) => {
    event.preventDefault();   // stop the form from submitting

    document.getElementById("macroFormButton")!.setAttribute("disabled", "");
    document.getElementById("stdout")!.innerText = "Sortie:";

    const args = {
        file: document.getElementById("file")!.getAttribute("value"),
    };
    ipcRenderer.send("form-submission", args);
});

document.getElementById("fileDialog")!.addEventListener("click", () => {
    const file = dialog.showOpenDialog({
        filters: [
            { name: "Excel", extensions: ["xlsx", "xlsm", "xls"] },
            { name: "All Files", extensions: ["*"] },
        ],
        properties: ["openFile"],
    });
    if (file !== undefined && file.length > 0) {
        document.getElementById("file")!.setAttribute("value", file[0]);
    }
});

ipcRenderer.on("stdout", (event: Event, data: string) => {
    console.log(data);
    const div = document.getElementById("stdout")!;
    div.innerHTML = div.innerHTML + "<br/>" + he.encode(data).replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
    div.scrollIntoView(false);
});

ipcRenderer.on("process-end" , (event: Event, data: string) => {
    document.getElementById("macroFormButton")!.removeAttribute("disabled");

    const div = document.getElementById("stdout")!;
    div.innerHTML = div.innerHTML + "<br/><br/> Macro terminée avec le code: " + code;
    div.scrollIntoView(false);
});

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



// list all files on the right

/*
const path = require('path');
const amdLoader = require('./node_modules/monaco-editor/min/vs/loader.js');
const amdRequire = amdLoader.require;
const amdDefine = amdLoader.require.define;

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, './node_modules/monaco-editor/min'))
});

// workaround monaco-css not understanding the environment
self.module = undefined;

amdRequire(['vs/editor/editor.main'], function() {
    var editor = monaco.editor.create(document.getElementById('container'), {
        value: [
            'function x() {',
            '\tconsole.log("Hello world!");',
            '}'
        ].join('\n'),
        language: 'python',
        theme: 'vs-dark'
    });
});
*/
