import PubSub from "pubsub-js";
import { ipcRenderer, Event } from "electron";
import { PythonFileContent } from "./PythonFileContent";
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
    }
}
