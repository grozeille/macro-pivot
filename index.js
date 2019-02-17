const { ipcRenderer, remote, shell } = require('electron');
const htmlspecialchars = require('htmlspecialchars');
const { dialog } = remote;
const currentWindow = remote.getCurrentWindow();

const submitForm = document.querySelector("#macroForm");

submitForm.addEventListener("submit", function(event){
    event.preventDefault();   // stop the form from submitting

    document.getElementById("macroFormButton").setAttribute("disabled", "");
    document.getElementById("stdout").innerText = "Sortie:";

    let args = {
        file: document.getElementById("file").value,
        srcSheet: document.getElementById("srcSheet").value,
        srcPosition: document.getElementById("srcPosition").value,
        destSheet: document.getElementById("destSheet").value,
        destPosition: document.getElementById("destPosition").value,
    };
    ipcRenderer.send('form-submission', args);
});

document.getElementById("fileDialog").addEventListener("click", function(event){
    let file = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel', extensions: ['xlsx', 'xlsm'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    document.getElementById("file").value = file;
});

ipcRenderer.on('stdout' , function(event , data){ 
    console.log(data);
    let div = document.getElementById("stdout");
    div.innerHTML = div.innerHTML + "<br/>" + htmlspecialchars(data).replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
    div.scrollIntoView(false);
});

ipcRenderer.on('process-end' , function(event , code){ 
    document.getElementById("macroFormButton").removeAttribute("disabled");

    let div = document.getElementById("stdout");
    div.innerHTML = div.innerHTML + "<br/><br/> Macro terminée avec le code: "+code;
    div.scrollIntoView(false);
});