import React from "react";
import LeftPanel from "../components/LeftPanel";
import StdoutPanel from "../components/StdoutPanel";
import CentralPanel from "../components/CentralPanel";
import SplitPane from "react-split-pane";
import Loop from "@material-ui/icons/Loop";
import GetApp from "@material-ui/icons/GetApp";
import PlayArrow from "@material-ui/icons/PlayArrow";
import {ipcRenderer, remote} from "electron";

export default class AppPanel extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    public render() {
        return (
            <div id="app-panel">
                <div id="app-toolbar">
                    <div className="app-toolbar-button" onClick={() => this.onRefreshClick()}>
                        <span><Loop></Loop> Rafraichir</span>
                    </div>
                    <div className="app-toolbar-button" onClick={() => this.onSaveClick()}>
                        <span><GetApp></GetApp> Sauvegarder</span>
                    </div>
                    <div className="app-toolbar-button" onClick={() => this.onExecuteClick()}>
                        <span><PlayArrow></PlayArrow> Exectuer</span>
                    </div>
                </div>
                <div id="app-split-panels">
                    <SplitPane split="vertical" minSize={200} defaultSize={300}>
                        <LeftPanel />
                        <SplitPane split="horizontal" minSize={200} primary="second">
                            <CentralPanel />
                            <StdoutPanel />
                        </SplitPane>
                    </SplitPane>
                </div>
            </div>
        );
    }

    private onRefreshClick() {
        ipcRenderer.send("refresh-files");
    }

    private onExecuteClick() {
        ipcRenderer.send("trigger-execute");
    }

    private onSaveClick() {
        // TODO
    }
}
