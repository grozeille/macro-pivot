import React, { MouseEvent } from "react";
import {ipcRenderer, remote} from "electron";
import { ProjectList } from "../../common/ProjectList";
import { PythonFile } from "../../common/PythonFile";
import { Project } from "../../common/Project";
import ListItem from "@material-ui/core/ListItem";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import FolderIcon from "@material-ui/icons/Folder";
import CodeIcon from "@material-ui/icons/Code";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddBoxIcon from "@material-ui/icons/AddBox";
import Typography from "@material-ui/core/Typography";
import LoopIcon from "@material-ui/icons/Loop";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

interface ILeftPanelState {
    data: ProjectList;
    selected: string;
    anchorProjectMenuEl: HTMLElement | null;
    anchorFileMenuEl: HTMLElement | null;
    menuX: number;
    menuY: number;
    activeProject: string;
}

export default class LeftPanel extends React.Component<{}, ILeftPanelState> {

    private divMenuPositionRef = React.createRef<HTMLDivElement>();

    constructor(props: {}) {
        super(props);
        this.state = {
            activeProject: "",
            anchorFileMenuEl: null,
            anchorProjectMenuEl: null,
            data: new ProjectList(),
            menuX: 0,
            menuY: 0,
            selected: "",
        };

        ipcRenderer.on("files-refreshed" , (event: Event, data: ProjectList) => {
            this.setState({ data, selected: "" });
        });
    }

    public render() {
        const { anchorFileMenuEl, anchorProjectMenuEl } = this.state;

        return (
            <div id="file-panel">
                <div id="menu-position" style={{
                    height: 0,
                    left: this.state.menuX,
                    position: "absolute",
                    top: this.state.menuY,
                    width: 0,
                }} ref={this.divMenuPositionRef}></div>
                <div id="file-container">
                    <List component="nav">
                        {this.refreshProjects()}
                    </List>
                    <Menu
                        id="project-menu"
                        anchorEl={anchorProjectMenuEl}
                        open={Boolean(anchorProjectMenuEl)}
                        onClose={() => this.handleMenuClose()}
                    >
                        <MenuItem onClick={this.handleMenuClose}>
                            <ListItemIcon>
                                <LoopIcon />
                            </ListItemIcon>
                            <Typography variant="inherit">Recharger</Typography>
                        </MenuItem>
                        <MenuItem onClick={this.handleMenuClose}>
                            <ListItemIcon>
                                <AddBoxIcon />
                            </ListItemIcon>
                            <Typography variant="inherit">Nouveau fichier</Typography>
                        </MenuItem>
                    </Menu>
                    <Menu
                        id="file-menu"
                        anchorEl={anchorFileMenuEl}
                        open={Boolean(anchorFileMenuEl)}
                        onClose={() => this.handleMenuClose()}
                    >
                        <MenuItem onClick={this.handleMenuClose}>
                            <ListItemIcon>
                                <LoopIcon />
                            </ListItemIcon>
                            <Typography variant="inherit">Recharger</Typography>
                        </MenuItem>
                        <MenuItem onClick={this.handleMenuClose}>
                            <ListItemIcon>
                                <DeleteForeverIcon />
                            </ListItemIcon>
                            <Typography variant="inherit">Supprimer</Typography>
                        </MenuItem>
                    </Menu>
                </div>
            </div>
        );
    }

    public componentDidMount() {
        ipcRenderer.send("refresh-files");
    }

    private refreshProjects(): JSX.Element[] {
        return this.state.data.Projects.map((p, i) => {
            return (
                <React.Fragment key={p.Name + "#fragment"}>
                    <ListItem
                        button onClick={() => this.handleProjectClick(p)}
                        key={p.Name}
                        onContextMenu={(e) => this.handleProjectRightClick(e)}>
                        <ListItemIcon>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText inset primary={p.Name} />
                        {this.state.activeProject === p.Path ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItem>
                    <Collapse
                        in={this.state.activeProject === p.Path}
                        timeout="auto"
                        unmountOnExit
                        key={p.Name + "#collapse"}>
                        <List disablePadding key={p.Name + "#files"}>
                            {this.refreshPythonFiles(p)}
                        </List>
                    </Collapse>
                </React.Fragment>
            );
        });
    }

    private refreshPythonFiles(project: Project): JSX.Element[] {
        return project.PythonFiles.map((f, i) => {
            return (
                <ListItem
                    onContextMenu={(e) => this.handleFileRightClick(e)}
                    onClick={() => this.handleFileClick(f)}
                    selected={this.state.selected === f.Path}
                    button
                    key={project.Name + "#files#" + f.Name}
                    style={{ paddingLeft: 30 }}>
                    <ListItemIcon>
                        <CodeIcon />
                    </ListItemIcon>
                    <ListItemText inset primary={f.Name} />
                </ListItem>
            );
        });
    }

    private handleProjectClick(project: Project) {
        this.setState({
            activeProject: project.Path,
        });
    }

    private handleFileClick(file: PythonFile) {
        this.setState({
            selected: file.Path,
        });
        ipcRenderer.send("open-file", file.Path);
    }

    private handleProjectRightClick(event: MouseEvent<HTMLElement>) {
        this.setState({
            anchorFileMenuEl: null,
            anchorProjectMenuEl: this.divMenuPositionRef.current!,
            menuX: event.clientX,
            menuY: event.clientY,
        });
    }

    private handleFileRightClick(event: MouseEvent<HTMLElement>) {
        this.setState({
            anchorFileMenuEl: this.divMenuPositionRef.current!,
            anchorProjectMenuEl: null,
            menuX: event.clientX,
            menuY: event.clientY,
        });
    }

    private handleMenuClose() {
        this.setState({
            anchorFileMenuEl: null,
            anchorProjectMenuEl: null,
            menuX: 0,
            menuY: 0,
        });
    }
}
