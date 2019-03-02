import React from "react";
import PubSub from "pubsub-js";
// import MonacoEditor from "react-monaco-editor";
// import * as monaco from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ResizeObserver } from "resize-observer";
import {ipcRenderer, remote} from "electron";
import { PythonFileContent } from "../../common/PythonFileContent";
import { ProjectList } from "../../common/ProjectList";

export default class EditorPanel extends React.Component<{}, {}> {

    private editorRef = React.createRef<HTMLDivElement>();
    private editor: monaco.editor.IStandaloneCodeEditor | undefined;

    constructor(props: {}) {
        super(props);

        PubSub.subscribe("request-execute-script", (message: string) => {
            if (this.editor!.getModel()) {
                const pythonFile = new PythonFileContent(
                    this.editor!.getModel()!.getValue(),
                    this.editor!.getModel()!.uri.fsPath);
                PubSub.publish("execute", pythonFile);
            }
        });

        ipcRenderer.on("files-refreshed" , (event: Event, data: ProjectList) => {
            this.editor!.setModel(null);
            monaco.editor.getModels().forEach((model: monaco.editor.ITextModel) => {
                model.dispose();
            });
        });

        ipcRenderer.on("file-opened" , (event: Event, pythonFile: PythonFileContent) => {
            // load the file if it's the first time. if not, keep the in-memory version
            if (!monaco.editor.getModel(monaco.Uri.file(pythonFile.Path))) {
                // load the new text
                const textModel = monaco.editor.createModel(
                    pythonFile.Content,
                    "python",
                    monaco.Uri.file(pythonFile.Path));
            }

            this.editor!.setModel(monaco.editor.getModel(monaco.Uri.file(pythonFile.Path)));
            this.editor!.updateOptions({ readOnly: pythonFile.Path === "" });
        });

        ipcRenderer.on("trigger-save" , (event: Event, data: ProjectList) => {
            if (this.editor!.getModel()) {
                ipcRenderer.send(
                    "save",
                    new PythonFileContent(this.editor!.getModel()!.getValue(), this.editor!.getModel()!.uri.fsPath));
            }
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
            readOnly: true,
            theme: "vs-dark",
            value: "",
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
