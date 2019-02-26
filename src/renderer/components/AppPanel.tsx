import React from "react";
import LeftPanel from "../components/LeftPanel";
import StdoutPanel from "../components/StdoutPanel";
import CentralPanel from "../components/CentralPanel";
import SplitPane from "react-split-pane";
import LoopIcon from "@material-ui/icons/Loop";
import GetAppIcon from "@material-ui/icons/GetApp";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import {ipcRenderer, remote} from "electron";
import Button from "@material-ui/core/Button";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import pink from "@material-ui/core/colors/pink";

const theme = createMuiTheme({
    palette: {
        primary: blue,
        secondary: pink,
    },
    typography: {
        useNextVariants: true,
    },
});

interface IAppPanelState {
    execution: boolean;
}

export default class AppPanel extends React.Component<{}, IAppPanelState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            execution: false,
        };

        ipcRenderer.on("trigger-execute", (event: Event) => {
            this.setState({ execution: true });
        });

        ipcRenderer.on("process-end", (event: Event, data: string) => {
            this.setState({ execution: false });
        });
    }

    public render() {
        return (
            <MuiThemeProvider theme={theme}>

                <div id="app-panel">
                    <div id="app-toolbar">
                        <Button
                            style={{ borderRadius: 0 }}
                            onClick={() => this.onRefreshClick()}>
                            <LoopIcon style={{ marginRight: 5}} ></LoopIcon>
                            Tout Recharger
                        </Button>
                        <Button
                            style={{ borderRadius: 0 }}
                            onClick={() => this.onCreateNewProjectClick()}>
                            <CreateNewFolderIcon style={{ marginRight: 5}} ></CreateNewFolderIcon>
                            Nouveau Projet
                        </Button>
                        <Button
                            style={{ borderRadius: 0 }}
                            onClick={() => this.onSaveClick()}>
                            <GetAppIcon style={{ marginRight: 5}} ></GetAppIcon>
                            Sauvegarder
                        </Button>
                        <Button
                            style={{ borderRadius: 0 }}
                            onClick={() => this.onExecuteClick()}
                            disabled={this.state.execution}>
                            <PlayArrowIcon style={{ marginRight: 5}} ></PlayArrowIcon>
                            Executer
                        </Button>
                        <Button
                            style={{ borderRadius: 0 }}
                            onClick={() => this.onStopClick()}
                            disabled={!this.state.execution}>
                            <StopIcon style={{ marginRight: 5}} ></StopIcon>
                            Stopper
                        </Button>
                    </div>
                    <div id="app-split-panels">
                        <SplitPane
                            split="vertical"
                            minSize={200}
                            defaultSize={300}
                            style={{ height: "calc(100% - 46px)" }}>
                            <LeftPanel />
                            <SplitPane split="horizontal" minSize={200} primary="second">
                                <CentralPanel />
                                <StdoutPanel />
                            </SplitPane>
                        </SplitPane>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }

    private onCreateNewProjectClick() {
        ipcRenderer.send("trigger-create-new-project");
    }

    private onRefreshClick() {
        ipcRenderer.send("trigger-refresh-files");
    }

    private onExecuteClick() {
        ipcRenderer.send("trigger-execute");
    }

    private onSaveClick() {
        ipcRenderer.send("trigger-save");
    }

    private onStopClick() {
        ipcRenderer.send("trigger-stop");
    }
}
