import React from "react";
import PubSub from "pubsub-js";
import * as he from "he";

export default class StdoutPanel extends React.Component<{}, {}> {

    private stdoutRef = React.createRef<HTMLDivElement>();

    constructor(props: {}) {
        super(props);

        this.handleSdout();
        this.handleExecute();
        this.handleProcessEnd();
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
        PubSub.subscribe("stdout", (message: string, data: string) => {
            console.log(data);
            this.stdoutRef.current!.innerHTML =
                this.stdoutRef.current!.innerHTML +
                "<br/>" +
                he.encode(data).replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
            this.stdoutRef.current!.scrollIntoView(false);
        });
    }

    private handleExecute() {
        PubSub.subscribe("execute", (message: string, data: string) => {
            console.log(data);
            this.stdoutRef.current!.innerHTML = "";
            this.stdoutRef.current!.scrollIntoView(false);
        });
    }

    private handleProcessEnd() {
        PubSub.subscribe("process-end" , (message: string, code: BigInteger) => {
            this.stdoutRef.current!.innerHTML =
                this.stdoutRef.current!.innerHTML +
                "<br/><br/> Macro terminée avec le code: " +
                code;

            this.stdoutRef.current!.scrollIntoView(false);
        });
    }
}
