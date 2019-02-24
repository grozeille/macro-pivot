import {Project} from "./Project";

export class ProjectList {
    public Projects: Project[];

    constructor(projects?: Project[]) {
        this.Projects = projects || [];
    }
}
