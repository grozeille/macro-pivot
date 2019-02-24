import React from "react";
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
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

interface ILeftPanelState {
    data: ProjectList;
    collapse: Map<string, boolean>;
    selected: string;
}

export default class LeftPanel extends React.Component<{}, ILeftPanelState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            collapse: new Map(),
            data: new ProjectList(),
            selected: "",
        };

        ipcRenderer.on("files-refreshed" , (event: Event, data: ProjectList) => {
            const collapse = new Map();
            data.Projects.forEach((project: Project) => {
                collapse.set(project.Path, true);
            });
            this.setState({ data, collapse, selected: "" });
        });
    }

    public render() {
        return (
            <div id="file-panel">
                <div id="file-container">
                    <List component="nav">
                        {this.refreshProjects()}
                    </List>
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
                    <ListItem button onClick={() => this.handleProjectClick(p)} key={p.Name}>
                        <ListItemIcon>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText inset primary={p.Name} />
                        {this.state.collapse.get(p.Path) ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse
                        in={this.state.collapse.get(p.Path)}
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
        this.setState((prevState, props) => {
            prevState.collapse.set(project.Path, !this.state.collapse.get(project.Path));
            return {
                collapse: prevState.collapse,
            };
        });
    }

    private handleFileClick(file: PythonFile) {
        this.setState({
            selected: file.Path,
        });
        ipcRenderer.send("open-file", file.Path);
    }
}
