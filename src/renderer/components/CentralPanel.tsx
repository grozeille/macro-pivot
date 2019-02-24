import React from "react";
import ExecutionMacroPanel from "./ExecutionMacroPanel";
import EditorPanel from "./EditorPanel";

export default class CentralPanel extends React.Component<{}, {}> {
    constructor(props: {}) {
        super(props);
    }

    public render() {
        return (
            <div id="editor-tab-panel">
                <ul className="mui-tabs__bar">
                    <li className="mui--is-active">
                        <a data-mui-toggle="tab" data-mui-controls="macro-tab">Executer</a>
                    </li>
                    <li>
                        <a data-mui-toggle="tab" data-mui-controls="editor-tab">Editeur</a>
                    </li>
                </ul>

                <div className="mui-tabs__pane mui--is-active" id="macro-tab">
                    <ExecutionMacroPanel />
                </div>

                <div className="mui-tabs__pane" id="editor-tab">
                    <EditorPanel />
                </div>
            </div>
        );
    }
}
