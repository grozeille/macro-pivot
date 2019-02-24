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
}

export default class LeftPanel extends React.Component<{}, ILeftPanelState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            collapse: new Map(),
            data: new ProjectList(),
        };

        ipcRenderer.on("files-refreshed" , (event: Event, data: ProjectList) => {
            const collapse = new Map();
            data.Projects.forEach((element: Project) => {
                collapse.set(element.Name, true);
            });
            this.setState({ data, collapse });
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
                        {this.state.collapse.get(p.Name) ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse
                        in={this.state.collapse.get(p.Name)}
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
        this.state.collapse.set(project.Name, !this.state.collapse.get(project.Name));
        // force refresh state
        this.setState({
            collapse: this.state.collapse,
            data: this.state.data,
        });
    }

    private handleFileClick(file: PythonFile) {
        ipcRenderer.send("open-file", file.Path);
    }
}
