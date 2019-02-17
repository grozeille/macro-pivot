const { spawn } = require('child_process');

const {app, BrowserWindow, ipcMain, shell } = require('electron');
// let {pyshell} =  require('python-shell');

function createWindow () {
    window = new BrowserWindow({width: 800, height: 700});
    window.loadFile('index.html');
    window.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        window = null;
    });
    return window;
}

function handleSubmission(window) {
    ipcMain.on('form-submission', (event, argument) => {
        const { file, srcSheet, srcPosition, destSheet, destPosition } = argument;

        var python_exe = './python/venv/Scripts/python.exe';
        var args = [
            './python/macro.py',
            file,
            srcSheet,
            srcPosition,
            destSheet,
            destPosition
        ];
        console.log("command line: ", python_exe, args);
        window.webContents.send('stdout' , python_exe + " "+ args.join(" "));

        var python = require('child_process').spawn(python_exe, args);
        python.stdout.on('data',(data) => {
            console.log("data: ", data.toString('utf8'));
            window.webContents.send('stdout' , data);
        });
        python.stderr.on('data',(data) => {
            console.log("data: ", data.toString('utf8'));
            window.webContents.send('stdout' , data);
        });
        python.on('close',(code) => {
            console.log(`child process exited with code ${code}`);
            window.webContents.send('process-end' , code);
        });        
    });
}

app.on('ready', () => {
    var window = createWindow();
    handleSubmission(window);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});