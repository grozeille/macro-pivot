import React from "react";
import LeftPanel from "../components/LeftPanel";
import StdoutPanel from "../components/StdoutPanel";
import CentralPanel from "../components/CentralPanel";
import PubSub from "pubsub-js";
import SplitPane from "react-split-pane";
import LoopIcon from "@material-ui/icons/Loop";
import GetAppIcon from "@material-ui/icons/GetApp";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import pink from "@material-ui/core/colors/pink";
import { MacroService } from "../../common/MacroService";

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
    createNewProjectDialog: boolean;
    createNewProjectName: string;
    refreshFilesDialog: boolean;
    fileOpened: boolean;
}

export default class AppPanel extends React.Component<{}, IAppPanelState> {

    private macroService: MacroService;

    constructor(props: {}) {
        super(props);
        this.state = {
            createNewProjectDialog: false,
            createNewProjectName: "",
            execution: false,
            fileOpened: false,
            refreshFilesDialog: false,
        };

        this.macroService = new MacroService();
        this.macroService.init();

        PubSub.subscribe("execute", () => {
            this.setState({ execution: true });
        });

        PubSub.subscribe("process-end", (code: BigInteger) => {
            this.setState({ execution: false });
        });

        PubSub.subscribe("open-file", (message: string, file: string) => {
            this.setState({ fileOpened: file !== "" });
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
                            onClick={() => this.onSaveClick()}
                            disabled={!this.state.fileOpened}>
                            <GetAppIcon style={{ marginRight: 5}} ></GetAppIcon>
                            Sauvegarder
                        </Button>
                        <Button
                            style={{ borderRadius: 0 }}
                            onClick={() => this.onExecuteClick()}
                            disabled={this.state.execution || !this.state.fileOpened}>
                            <PlayArrowIcon style={{ marginRight: 5}} ></PlayArrowIcon>
                            Executer
                        </Button>
                        <Button
                            style={{ borderRadius: 0 }}
                            onClick={() => this.onStopClick()}
                            disabled={!this.state.execution || !this.state.fileOpened}>
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

                    <Dialog
                    open={this.state.createNewProjectDialog}
                    onClose={() => this.handleCloseNewProjectDialog()}
                    aria-labelledby="form-dialog-title"
                    maxWidth="sm"
                    fullWidth={true}
                    >
                    <DialogTitle id="form-dialog-title">Nouveau Projet</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        Choisir un nom de projet.
                        </DialogContentText>
                        <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Nom du projet"
                        fullWidth
                        type="text"
                        onChange={(event) => this.setState({ createNewProjectName: event.currentTarget.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.handleCloseNewProjectDialog()} color="primary">
                        Annuler
                        </Button>
                        <Button onClick={() => this.handleCreateNewProject()} color="primary">
                        Créer
                        </Button>
                    </DialogActions>
                    </Dialog>

                    <Dialog
                    open={this.state.refreshFilesDialog}
                    onClose={() => this.handleCloseRefreshFilesDialog()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    >
                    <DialogTitle id="alert-dialog-title">Tout Recharger ?</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        L'application va recharger les fichiers depuis le système de fichier.
                        Toutes les modifications non-sauvegardées vont être perdues.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.handleCloseRefreshFilesDialog()} color="primary">
                        Annuler
                        </Button>
                        <Button onClick={() => this.handleRefresh()} color="primary" autoFocus>
                        Tout Recharger
                        </Button>
                    </DialogActions>
                    </Dialog>
                </div>
            </MuiThemeProvider>
        );
    }

    private handleCloseRefreshFilesDialog() {
        this.setState({ refreshFilesDialog: false });
    }

    private handleRefresh() {
        this.setState({ refreshFilesDialog: false });
        PubSub.publish("refresh-files", null);
    }

    private onCreateNewProjectClick() {
        this.setState({
            createNewProjectDialog: true,
            createNewProjectName: "",
        });
    }

    private handleCloseNewProjectDialog() {
        this.setState({
            createNewProjectDialog: false,
            createNewProjectName: "",
        });
    }

    private handleCreateNewProject() {
        PubSub.publish("create-new-project", this.state.createNewProjectName);
        this.setState({
            createNewProjectDialog: false,
            createNewProjectName: "",
        });
    }

    private onRefreshClick() {
        this.setState({ refreshFilesDialog: true });
    }

    private onExecuteClick() {
        PubSub.publish("execute", null);
    }

    private onSaveClick() {
        PubSub.publish("save", null);
    }

    private onStopClick() {
        PubSub.publish("stop", null);
    }
}
