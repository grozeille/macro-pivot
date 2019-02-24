export class PythonFileContent {
    public Path: string;
    public Content: string;

    constructor(content?: string, path?: string) {
        this.Content = content || "";
        this.Path = path || "";
    }
}