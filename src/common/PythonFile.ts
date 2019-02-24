export class PythonFile {
    public Name: string;
    public Path: string;

    constructor(name?: string, path?: string) {
        this.Name = name || "";
        this.Path = path || "";
    }
}