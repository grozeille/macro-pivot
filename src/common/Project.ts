import {PythonFile} from "./PythonFile";

export class Project {

    public Name: string;
    public Path: string;
    public PythonFiles: PythonFile[];

    constructor(name?: string, path?: string) {
        this.Name = name || "";
        this.Path = path || "";
        this.PythonFiles = [];
    }
}
