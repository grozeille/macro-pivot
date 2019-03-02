import React, { MouseEvent } from "react";
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
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

interface ILeftPanelState {
    activeProject: string;
    anchorProjectMenuEl: HTMLElement | null;
    anchorFileMenuEl: HTMLElement | null;
    data: ProjectList;
    menuSelectedProject: string;
    menuX: number;
    menuY: number;
    selectedFile: string;
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
            menuSelectedProject: "",
            menuX: 0,
            menuY: 0,
            selectedFile: "",
        };

        PubSub.subscribe("files-refreshed" , (message: string, data: ProjectList) => {
            this.setState({ data, selectedFile: "", activeProject: "" });
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
                        {this.buildProjects()}
                    </List>
                    <Menu
                        id="project-menu"
                        anchorEl={anchorProjectMenuEl}
                        open={Boolean(anchorProjectMenuEl)}
                        onClose={() => this.handleMenuClose()}
                    >
                        <MenuItem onClick={() => this.handleMenuRefreshProject()}>
                            <ListItemIcon>
                                <LoopIcon />
                            </ListItemIcon>
                            <Typography variant="inherit">Recharger</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => this.handleMenuNewFile()}>
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
                        <MenuItem onClick={() => this.handleMenuRefreshFile()}>
                            <ListItemIcon>
                                <LoopIcon />
                            </ListItemIcon>
                            <Typography variant="inherit">Recharger</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => this.handleMenuDeleteFile()}>
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
        PubSub.publish("refresh-files", null);
    }

    private buildProjects(): JSX.Element[] {
        return this.state.data.Projects.map((p, i) => {
            return (
                <React.Fragment key={p.Name + "#fragment"}>
                    <ListItem
                        button onClick={() => this.handleProjectClick(p)}
                        key={p.Name}
                        onContextMenu={(e) => this.handleProjectRightClick(e, p)}>
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
                            {this.buildPythonFiles(p)}
                        </List>
                    </Collapse>
                </React.Fragment>
            );
        });
    }

    private buildPythonFiles(project: Project): JSX.Element[] {
        return project.PythonFiles.map((f, i) => {
            return (
                <ListItem
                    onContextMenu={(e) => this.handleFileRightClick(e, f)}
                    onClick={() => this.handleFileClick(f)}
                    selected={this.state.selectedFile === f.Path}
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
            selectedFile: file.Path,
        });
        PubSub.publish("open-file", file.Path);
    }

    private handleProjectRightClick(event: MouseEvent<HTMLElement>, project: Project) {
        this.setState({
            anchorFileMenuEl: null,
            anchorProjectMenuEl: this.divMenuPositionRef.current!,
            menuSelectedProject: project.Path,
            menuX: event.clientX,
            menuY: event.clientY,
        });
    }

    private handleFileRightClick(event: MouseEvent<HTMLElement>, pythonFile: PythonFile) {
        this.setState({
            anchorFileMenuEl: this.divMenuPositionRef.current!,
            anchorProjectMenuEl: null,
            menuX: event.clientX,
            menuY: event.clientY,
            selectedFile: pythonFile.Path,
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

    private handleMenuRefreshProject() {
        console.log("Refresh project: " + this.state.menuSelectedProject);
        this.setState({ menuSelectedProject: "", activeProject: this.state.menuSelectedProject});
        this.handleMenuClose();
    }

    private handleMenuNewFile() {
        console.log("New file into project: " + this.state.menuSelectedProject);
        this.setState({ menuSelectedProject: "", activeProject: this.state.menuSelectedProject});
        this.handleMenuClose();
    }

    private handleMenuRefreshFile() {
        console.log("Refresh file: " + this.state.selectedFile);
        this.handleMenuClose();
    }

    private handleMenuDeleteFile() {
        console.log("Delete file: " + this.state.selectedFile);
        this.handleMenuClose();
    }
}
