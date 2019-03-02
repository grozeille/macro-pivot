import React from "react";
import {ipcRenderer, remote} from "electron";
import PubSub from "pubsub-js";

const dialog = remote.dialog;

interface IExecutionMacroPanelProps {
    filePath?: string;
}

interface IExecutionMacroPanelState {
    filePath: string;
}

export default class ExecutionMacroPanel extends React.Component<IExecutionMacroPanelProps, IExecutionMacroPanelState> {

    constructor(props: IExecutionMacroPanelProps) {
        super(props);
        this.state = {
            filePath: this.props.filePath || "",
        };
    }

    public render() {
        return (
            <div id="central-container" className="mui-container">
                <form id="macroForm" action="#" className="mui-form">
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
            PubSub.publish("excel-file-changed", this.state.filePath);
        }
    }

    private onFileChanged(filePath: string) {
        this.setState({ filePath });
        PubSub.publish("excel-file-changed", this.state.filePath);
    }

}
