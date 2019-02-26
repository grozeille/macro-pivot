import {app, BrowserWindow, ipcMain} from "electron";
import * as path from "path";
import { lstatSync, readdirSync, readFileSync } from "fs";
import { format as formatUrl } from "url";
import {MacroArguments} from "../common/MacroArguments";
import {spawn, ChildProcess} from "child_process";
import encoding from "text-encoding";
import { Project } from "../common/Project";
import { PythonFile } from "../common/PythonFile";
import { ProjectList } from "../common/ProjectList";
import { PythonFileContent } from "../common/PythonFileContent";

let mainWindow: Electron.BrowserWindow | null;
const isDevelopment = process.env.NODE_ENV !== "production";
const decoder = new encoding.TextDecoder("utf-8");

let lastOpenedFiled: string | null = null;
let pythonProcess: ChildProcess | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        height: 800,
        title: "Excel Python Macro Editor",
        width: 1000,
    });


    if (isDevelopment) {
        mainWindow.webContents.openDevTools();
    }

    if (isDevelopment) {
        mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    } else {
        mainWindow.loadURL(formatUrl({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file",
            slashes: true,
        }));
    }

    // mainWindow.loadFile(path.join(__dirname, "../assets/index.html"));
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.webContents.on("devtools-opened", () => {
        mainWindow!.focus();
        setImmediate(() => {
            mainWindow!.focus();
        });
    });

    return mainWindow;
}

function getAppPath(): string {
    let rootPath = app.getAppPath();
    if (rootPath.indexOf("\\default_app.asar") !== -1) {
        rootPath = rootPath.replace("\\default_app.asar", "\\..\\..\\..\\..");
    } else if (rootPath.indexOf("\\app.asar") !== -1) {
        rootPath = rootPath.replace("\\app.asar", "\\..");
    }
    return rootPath;
}

function getWorkspacePath(): string {
    const rootPath = getAppPath();
    let workspacePath = "";
    if (process.env.WORKSPACE) {
        workspacePath = process.env.WORKSPACE;
    } else {
        workspacePath = rootPath + "\\workspace";
    }
    return workspacePath;
}

function handleExecute(window: Electron.BrowserWindow) {
    ipcMain.on("execute", (event: any, argument: MacroArguments) => {
        const rootPath = getAppPath();
        console.log("base path: ", rootPath);

        let pythonPath = "";
        if (process.env.PYTHONPATH) {
            pythonPath = process.env.PYTHONPATH;
        } else {
            pythonPath = rootPath + "\\Python3";
        }
        console.log("python home: ", pythonPath);

        const workspacePath = getWorkspacePath();
        console.log("workspace: ", workspacePath);

        window.webContents.send("stdout" , null);
        window.webContents.send("stdout" , "Sortie:");

        const pythonExe = pythonPath + "\\python.exe";
        const args: ReadonlyArray<string> = [
            workspacePath + "\\pivot\\macro.py",
            argument.file,
        ];
        console.log("command line: ", pythonExe, args);
        window.webContents.send("stdout" , pythonExe + " " + args.join(" "));

        const env = Object.create( process.env );
        env.PYTHONPATH = pythonPath;
        env.PYTHONIOENCODING = "UTF-8";

        pythonProcess = spawn(pythonExe, args, { env });
        pythonProcess.stdout.setEncoding("utf8");
        pythonProcess.stdout.on("data", (data: any) => {
            const dataString = decoder.decode(data);
            console.log("data: ", dataString);
            window.webContents.send("stdout" , data);
        });
        pythonProcess.stderr.on("data", (data: any) => {
            const dataString = decoder.decode(data);
            console.log("data: ", dataString);
            window.webContents.send("stdout" , dataString);
        });
        pythonProcess.on("error", (err: any) => {
            console.log(`error when starting process ${err}`);
            window.webContents.send("process-end", -1);
            pythonProcess = null;
        });
        pythonProcess.on("close", (code: any) => {
            console.log(`child process exited with code ${code}`);
            window.webContents.send("process-end", code);
            pythonProcess = null;
        });
    });
}

function handleRefreshFiles(window: Electron.BrowserWindow) {
    ipcMain.on("trigger-refresh-files", (event: any) => {
        window.webContents.send("trigger-refresh-files");
    });
    ipcMain.on("refresh-files", (event: any) => {
        const workspacePath = getWorkspacePath();

        const isDirectory = (source: Project) => lstatSync(source.Path).isDirectory();
        const isFile = (source: PythonFile) => lstatSync(source.Path).isFile();

        const getDirectories = (source: string) =>
            readdirSync(source)
            .map((name: string) => {
                return new Project(name, path.join(source, name));
            })
            .filter(isDirectory)
            .filter((project: Project) => !project.Name.startsWith("."))
            .map((project: Project) => {
                project.PythonFiles = readdirSync(project.Path)
                .map((name: string) => {
                    return new PythonFile(name, path.join(project.Path, name));
                })
                .filter(isFile);
                return project;
            });
        const projectList = getDirectories(workspacePath);
        window.webContents.send("files-refreshed" , new ProjectList(projectList));
    });
}

function handleOpenFile(window: Electron.BrowserWindow) {
    ipcMain.on("open-file", (event: any, filePath: string) => {

        if (lastOpenedFiled === filePath) {
            return;
        }
        lastOpenedFiled = filePath;

        if (filePath !== "") {
            const contents = readFileSync(filePath, "utf8");
            const pythonFileContent = new PythonFileContent(contents, filePath);
            window.webContents.send("file-opened" , pythonFileContent);
        } else {
            window.webContents.send("file-opened" , new PythonFileContent("", ""));
        }
    });
}

function handleTriggerExecute(window: Electron.BrowserWindow) {
    ipcMain.on("trigger-execute", (event: any) => {
        window.webContents.send("trigger-execute");
    });
}

function handleTriggerStop(window: Electron.BrowserWindow) {
    ipcMain.on("trigger-stop", (event: any) => {
        window.webContents.send("trigger-stop");
    });
    ipcMain.on("stop", (event: any) => {
        if (pythonProcess !== null) {
            pythonProcess.kill("-9");
        }
    });
}

app.on("ready", () => {
    const w = createWindow();
    handleExecute(w);
    handleRefreshFiles(w);
    handleOpenFile(w);
    handleTriggerExecute(w);
    handleTriggerStop(w);
});

app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
});

app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
