import React from "react";
import {ipcRenderer} from "electron";
import * as he from "he";

export default class StdoutPanel extends React.Component<{}, {}> {

    private stdoutRef = React.createRef<HTMLDivElement>();

    constructor(props: {}) {
        super(props);

        this.handleSdout();
        this.handleMacroExecuted();
    }

    public render() {
        return (
            <div id="stdout-panel">
                <div id="stdout-container">
                    <div id="stdout" className="mui--text-light" ref={this.stdoutRef}>
                    </div>
                </div>
            </div>
        );
    }

    private handleSdout() {
        ipcRenderer.on("stdout", (event: Event, data: string | null) => {
            if (data == null) {
                this.stdoutRef.current!.innerHTML = "";
            } else {
                console.log(data);
                this.stdoutRef.current!.innerHTML =
                    this.stdoutRef.current!.innerHTML +
                    "<br/>" +
                    he.encode(data).replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
            }
            this.stdoutRef.current!.scrollIntoView(false);
        });
    }

    private handleMacroExecuted() {
        ipcRenderer.on("process-end" , (event: Event, code: BigInteger) => {
            this.stdoutRef.current!.innerHTML =
                this.stdoutRef.current!.innerHTML +
                "<br/><br/> Macro terminée avec le code: " +
                code;

            this.stdoutRef.current!.scrollIntoView(false);
        });
    }
}
