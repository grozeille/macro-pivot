import React from "react";
// import MonacoEditor from "react-monaco-editor";
// import * as monaco from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ResizeObserver } from "resize-observer";
import {ipcRenderer, remote} from "electron";
import { PythonFileContent } from "../../common/PythonFileContent";
import { ProjectList } from "../../common/ProjectList";

interface IEditorPanelState {
    code: Map<string, string>;
    currentFile: string;
}

export default class EditorPanel extends React.Component<{}, IEditorPanelState> {

    private editorRef = React.createRef<HTMLDivElement>();
    private editor: monaco.editor.IStandaloneCodeEditor | undefined;

    constructor(props: {}) {
        super(props);

        const code = new Map();
        code.set("", "");
        this.state = { code, currentFile: "" };

        ipcRenderer.on("files-refreshed" , (event: Event, data: ProjectList) => {
            const newCode = new Map();
            newCode.set("", "");
            this.setState({ code, currentFile: "" });
        });

        ipcRenderer.on("file-opened" , (event: Event, pythonFile: PythonFileContent) => {
            // don't override if already opened
            if (!this.state.code.has(pythonFile.Path)) {
                // load the new text
                this.state.code.set(pythonFile.Path, pythonFile.Content);
            }

            // keep the previous text
            if (this.state.currentFile !== pythonFile.Path) {
                this.state.code.set(this.state.currentFile, this.editor!.getValue());
            }

            this.setState({
                currentFile: pythonFile.Path,
            });
            const currentCode = this.state.code.get(this.state.currentFile)!;
            this.editor!.setValue(currentCode);
            this.editor!.updateOptions({ readOnly: pythonFile.Path === "" });
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
            value: this.state.code.get(this.state.currentFile)!,
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
