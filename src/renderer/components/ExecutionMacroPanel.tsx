import React from "react";
import {ipcRenderer, remote} from "electron";

const dialog = remote.dialog;

interface IExecutionMacroPanelProps {
    filePath?: string;
}

interface IExecutionMacroPanelState {
    filePath: string;
    running: boolean;
}

export default class ExecutionMacroPanel extends React.Component<IExecutionMacroPanelProps, IExecutionMacroPanelState> {

    constructor(props: IExecutionMacroPanelProps) {
        super(props);
        this.state = {
            filePath: this.props.filePath || "",
            running: false,
        };

        this.handleOnMacroExecuted();
    }

    public render() {
        return (
            <div id="central-container" className="mui-container">
                <form id="macroForm" action="#" className="mui-form" onSubmit={(event) => this.handleSubmit(event)}>
                    <div className="mui-row">
                        <div className="mui-col-md-9">
                            <div className="mui-textfield">
                                <input
                                    id="file"
                                    type="text"
                                    onChange={(event) => this.onFileChanged(event.currentTarget.value)}
                                    value={this.state.filePath} />
                                <label>Fichier excel</label>
                            </div>
                        </div>
                        <div className="mui-col-md-3">
                            <div className="mui--text-right">
                                <button
                                    id="fileDialog"
                                    type="button"
                                    className="mui-btn mui-btn--raised mui-btn"
                                    onClick={() => this.onFileClick() }>Parcourir</button>
                            </div>
                        </div>
                    </div>
                    <button
                        id="macroFormButton"
                        type="submit"
                        className="mui-btn mui-btn--raised mui-btn--primary"
                        disabled={this.state.running}>Executer</button>
                </form>
            </div>
        );
    }

    private  onFileClick() {
        const file = dialog.showOpenDialog({
            filters: [
                { name: "Excel", extensions: ["xlsx", "xlsm", "xls"] },
                { name: "All Files", extensions: ["*"] },
            ],
            properties: ["openFile"],
        });
        if (file !== undefined && file.length > 0) {
            this.setState({ filePath: file[0] });
        }
    }

    private onFileChanged(filePath: string) {
        this.setState({ filePath });
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.execute();
    }

    private execute() {
        this.setState({ running: true});

        const args = {
            file: this.state.filePath,
        };
        ipcRenderer.send("execute", args);
    }

    private handleOnMacroExecuted() {
        ipcRenderer.on("trigger-execute", (event: Event) => {
            this.execute();
        });

        ipcRenderer.on("process-end", (event: Event, data: string) => {
            this.setState({ running: false});
        });

        ipcRenderer.on("trigger-stop", (event: Event) => {
            ipcRenderer.send("stop");
        });
    }

}
