import React from "react";
import {ipcRenderer, remote} from "electron";
import { ProjectList } from "../../common/ProjectList";
import { PythonFile } from "../../common/PythonFile";
import { Project } from "../../common/Project";
import MuiTreeView from "material-ui-treeview";

interface ILeftPanelState {
    data: ProjectList;
    tree: any[];
}

export default class LeftPanel extends React.Component<{}, ILeftPanelState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            data: new ProjectList(),
            tree: [],
        };

        ipcRenderer.on("files-refreshed" , (event: Event, data: ProjectList) => {
            this.setState({
                data,
                tree: this.buildTree(data)
            });
        });
    }

    public render() {
        return (
            <div id="file-container">
                <MuiTreeView tree={this.state.tree} />
            </div>
        );
    }

    public componentDidMount() {
        ipcRenderer.send("refresh-files");
    }

    private buildTree(projects: ProjectList): any[] {
        return projects.Projects.map((p, i) => {
            return {
                data: p,
                nodes: this.buildTreeFiles(p),
                value: p.Name,
            };
        });
    }

    private buildTreeFiles(project: Project): any[] {
        return project.PythonFiles.map((f, i) => {
            return {
                data: f,
                value: f.Name,
            };
        });
    }
}
