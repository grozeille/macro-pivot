import React from "react";
import MonacoEditor from "react-monaco-editor";
// import * as monaco from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ResizeObserver } from "resize-observer";

interface IEditorPanelProps {
    someDefaultValue?: string;
}

interface IEditorPanelState {
    someValue: string;
}

export default class EditorPanel extends React.Component<IEditorPanelProps, IEditorPanelState> {

    private editorRef = React.createRef<HTMLDivElement>();
    private editor: monaco.editor.IEditor | undefined;

    constructor(props: IEditorPanelProps) {
        super(props);
        this.state = { someValue: this.props.someDefaultValue || "" };
    }

    public render() {
        return (
            <div id="editor-container" ref={this.editorRef}></div>
        );
    }

    public componentDidMount() {
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

        const editorContainer = this.editorRef.current!;
        this.editor = monaco.editor.create(editorContainer, {
            language: "python",
            theme: "vs-dark",
            value: code,
        });

        monaco.editor.setTheme("chrome");

        this.outputsize();

        const localOutputSize = () => this.outputsize();

        new ResizeObserver(localOutputSize).observe(editorContainer);
    }

    private outputsize() {
        this.editor!.layout();
    }
}
