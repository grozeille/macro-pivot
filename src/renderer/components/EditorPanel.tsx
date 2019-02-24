import React from "react";
// import MonacoEditor from "react-monaco-editor";
// import * as monaco from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ResizeObserver } from "resize-observer";
import {ipcRenderer, remote} from "electron";

interface IEditorPanelState {
    code: string;
}

export default class EditorPanel extends React.Component<{}, IEditorPanelState> {

    private editorRef = React.createRef<HTMLDivElement>();
    private editor: monaco.editor.IStandaloneCodeEditor | undefined;

    constructor(props: {}) {
        super(props);

        const code = ["import xlwings as xw",
        "import sys",
        "",
        "def run_macro(file_path):",
        "    print(file_path)",
        "    #wb = xw.Book(file_path)",
        "    #sht = wb.sheets['Sheet1']",
        "",
        "if __name__ == '__main__':",
        "   file_path = sys.argv[1]",
        "",
        "   run_macro(file_path)"].join("\n");
        this.state = { code };

        ipcRenderer.on("file-opened" , (event: Event, data: string) => {
            this.setState({ code: data });
            this.editor!.setValue(this.state.code);
            // this.forceUpdate();
        });
    }

    public render() {
        return (
            <div id="editor-container" ref={this.editorRef}></div>
        );
    }

    public componentDidMount() {
        // configure the editor
        // tslint:disable-next-line: no-var-requires
        const chromeTheme = require("./themes/Chrome DevTools.json");
        monaco.editor.defineTheme("chrome", chromeTheme);
        monaco.editor.setTheme("chrome");

        const editorContainer = this.editorRef.current!;
        this.editor = monaco.editor.create(editorContainer, {
            language: "python",
            theme: "vs-dark",
            value: this.state.code,
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
