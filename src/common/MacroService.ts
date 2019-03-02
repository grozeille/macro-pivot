import PubSub from "pubsub-js";
import { ipcRenderer, Event } from "electron";
import { PythonFileContent } from "./PythonFileContent";
import { ProjectList } from "./ProjectList";
import { MacroArguments } from "./MacroArguments";

export class MacroService {
    private currentPythonFile: PythonFileContent | null;
    private currentExcelFile: string | null;

    constructor() {
        this.currentPythonFile = null;
        this.currentExcelFile = null;
    }

    public init() {
        ipcRenderer.on("process-end", (event: Event, code: BigInteger) => {
            PubSub.publish("process-end", code);
        });

        ipcRenderer.on("stdout", (event: Event, data: string) => {
            PubSub.publish("stdout", data);
        });

        ipcRenderer.on("file-opened", (event: Event, file: PythonFileContent) => {
            PubSub.publish("file-opened", file);
        });

        ipcRenderer.on("files-refreshed", (event: Event, projectList: ProjectList) => {
            PubSub.publish("files-refreshed", projectList);
            PubSub.publish("open-file", "");
        });

        PubSub.subscribe("execute", (message: string, file: PythonFileContent | null) => {
            if (file === null) {
                PubSub.publish("request-execute-script", null);
            } else {
                const args = new MacroArguments();
                args.exceFile = this.currentExcelFile === null ? "" : this.currentExcelFile;
                args.pythonFile = file === null ? this.currentPythonFile! : file;
                ipcRenderer.send("execute", args);
            }
        });

        PubSub.subscribe("excel-file-changed", (message: string, filePath: string) => {
            this.currentExcelFile = filePath;
        });

        PubSub.subscribe("open-file", (message: string, file: string) => {
            ipcRenderer.send("open-file", file);
        });

        PubSub.subscribe("save" , (message: string, file: PythonFileContent | null) => {
            if (file) {
                ipcRenderer.send("save", file);
            }
        });

        PubSub.subscribe("stop" , (message: string) => {
            ipcRenderer.send("stop");
        });

        PubSub.subscribe("create-new-project" , (message: string, projectName: string) => {
            ipcRenderer.send("create-new-project", projectName);
        });

        PubSub.subscribe("refresh-files" , (message: string) => {
            ipcRenderer.send("refresh-files");
        });
    }
}
