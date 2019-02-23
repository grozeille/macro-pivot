import {app, BrowserWindow, ipcMain} from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import {MacroArguments} from "../common/MacroArguments";
import {spawn} from "child_process";
import encoding from "text-encoding";

let mainWindow: Electron.BrowserWindow | null;
const isDevelopment = process.env.NODE_ENV !== "production";
const decoder = new encoding.TextDecoder("utf-8");

function createWindow() {
    mainWindow = new BrowserWindow({width: 1000, height: 800});


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

function handleSubmission(window: Electron.BrowserWindow) {
    ipcMain.on("form-submission", (argument: MacroArguments) => {
        let rootPath = app.getAppPath();
        if (rootPath.indexOf("default_app.asar") !== -1) {
            rootPath = rootPath.replace("default_app.asar", "..\\..\\..\\..");
        }

        console.log("basepath: ", rootPath);

        window.webContents.send("stdout" , null);
        window.webContents.send("stdout" , "Sortie:");

        const pythonExe = rootPath + "\\Python3\\python.exe";
        const args: ReadonlyArray<string> = [
            rootPath + "\\workspace\\pivot\\macro.py",
            argument.file,
        ];
        console.log("command line: ", pythonExe, args);
        window.webContents.send("stdout" , pythonExe + " " + args.join(" "));

        const env = Object.create( process.env );
        env.PYTHONPATH = rootPath + "\\Python3";

        const python = spawn(pythonExe, args, { env });
        python.stdout.setEncoding("utf8");
        python.stdout.on("data", (data: any) => {
            const dataString = decoder.decode(data);
            console.log("data: ", dataString);
            window.webContents.send("stdout" , data);
        });
        python.stderr.on("data", (data: any) => {
            const dataString = decoder.decode(data);
            console.log("data: ", dataString);
            window.webContents.send("stdout" , dataString);
        });
        python.on("error", (err: any) => {
            console.log(`error when starting process ${err}`);
            window.webContents.send("process-end", -1);
        });
        python.on("close", (code: any) => {
            console.log(`child process exited with code ${code}`);
            window.webContents.send("process-end", code);
        });
    });
}

app.on("ready", () => {
    const w = createWindow();
    handleSubmission(w);
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
